const express = require("express"); // 👈 Isko 'express' kar do bhai!
const router = express.Router();
const Query = require("../models/Query");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { Resend } = require("resend"); // 👈 Nodemailer ki jagah Resend Import kiya

// 🚀 INITIALIZE RESEND ENGINE WITH SECURE ENV KEY
const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================================================================
    🟢 PUBLIC ROUTE: Submit Query (With Dynamic Ticket & Resend HTTP API)
   ========================================================================= */
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🎟️ GENERATE UNIQUE TICKET ID USING MATH LOGIC
    const generatedTicketId = `KI-${Math.floor(100000 + Math.random() * 900000)}`;

    const newQuery = new Query({ 
      ticketId: generatedTicketId,
      name, 
      email, 
      phone, 
      message 
    });
    
    // Save to MongoDB Cloud
    await newQuery.save();

    // 📬 PREMIUM HTML EMAIL TEMPLATE DESIGN FOR RESEND
    const mailPayload = {
      from: "Kiwi Interio Studio <onboarding@resend.dev>", // 👈 Free account me hamesha yahi domain rahega sandboxing ke liye
      to: email, // Client ka actual email id
      subject: `Inquiry Registered Successfully - Ticket: ${generatedTicketId}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e0; padding: 40px; color: #1c1917; background-color: #ffffff;">
          <div style="text-align: left; border-bottom: 2px solid #1c1917; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin: 0; color: #000000;">KIWI INTERIO</h1>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 5px; color: #78716c; margin: 5px 0 0 0;">Workspace Architecture & Spatial Studio</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #44403c;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Thank you for contacting our design studio. We have successfully registered your spatial concept design requirement schema within our core engine database.</p>
          
          <div style="background-color: #f5f5f4; border-left: 4px solid #000000; padding: 20px; margin: 30px 0; border-radius: 2px;">
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #78716c; font-weight: bold; letter-spacing: 1px;">Your Support Token Reference</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #000000; letter-spacing: 1px;">${generatedTicketId}</p>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Our dedicated design lead or relationship administrator will review your project payload and securely reach back to you at <span style="border-bottom: 1px dashed #78716c; font-weight: 600;">${phone}</span> within 24 business hours.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e0; text-align: left;">
            <p style="font-size: 14px; font-weight: bold; margin: 0; color: #000000;">Regards,</p>
            <p style="font-size: 13px; margin: 4px 0 0 0; color: #57534e;">Operations Desk<br />Kiwi Interio Studio</p>
          </div>
        </div>
      `,
    };

    // ⚡ FIRE ASYNC RESEND API CALL (Bypasses port limits instantly!)
    resend.emails.send(mailPayload)
      .then((data) => console.log(`🚀 Resend HTTP Dispatch Success! ID:`, data.id))
      .catch((err) => console.error("❌ Resend Transmission Fail:", err));

    // Immediate Response to React Frontend
    return res.status(201).json({ 
      success: true, 
      message: "Query submitted successfully!",
      ticketId: generatedTicketId 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================================
    🔴 PROTECTED ROUTE 1: Get All Queries
   ========================================================================= */
router.get("/all", authMiddleware, roleMiddleware("admin", "hr", "manager"), async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================================================================
    🟢 DEV ROUTE: Update/Delete Status Logic (With Resend Resolution Email)
   ========================================================================= */
router.post("/update-status/:id", authMiddleware, roleMiddleware("admin", "hr", "manager"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In-Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ message: `Invalid status value received: ${status}` });
    }

    // 🎯 IF STATUS IS RESOLVED -> SEND CLOSURE EMAIL VIA HTTP & DELETE FROM DB
    if (status === "Resolved") {
      const currentQuery = await Query.findById(req.params.id);

      if (!currentQuery) {
        return res.status(404).json({ message: "Query log not found in database" });
      }

      const resolutionPayload = {
        from: "Kiwi Interio Studio <onboarding@resend.dev>",
        to: currentQuery.email,
        subject: `Ticket Resolved Successfully - Ticket: ${currentQuery.ticketId || "KI-LOG"}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e0; padding: 40px; color: #1c1917; background-color: #ffffff;">
            <div style="text-align: left; border-bottom: 2px solid #1c1917; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin: 0; color: #1c1917;">KIWI INTERIO</h1>
              <p style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; color: #78716c; margin: 5px 0 0 0;">Inquiry Life-Cycle Management</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #44403c;">Hello <strong>${currentQuery.name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">This notification confirms that our interior operations desk has successfully processed and closed your spatial design ticket.</p>
            
            <div style="background-color: #fafaf9; border: 1px solid #e5e5e0; padding: 20px; margin: 30px 0; border-radius: 2px; text-align: center;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: bold; letter-spacing: 0.5px;">Status Update for Token <span style="font-family: monospace;">${currentQuery.ticketId || "LOG"}</span></p>
              <p style="margin: 10px 0 0 0; font-size: 20px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px;">✓ RESOLVED & CLOSED</p>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #6b6661;">If you are fully satisfied with the communication or solution provided by our relationship team, you can safely ignore this automated transmission thread.</p>
          </div>
        `,
      };

      // Fire Closure Email via Resend API
      resend.emails.send(resolutionPayload)
        .then((data) => console.log(`🚀 Resolution Email Dispatched via HTTP! ID:`, data.id))
        .catch((err) => console.error("❌ Resolution Email Failed:", err));

      // Clear from MongoDB Cloud
      await Query.findByIdAndDelete(req.params.id);

      return res.status(200).json({ 
        success: true, 
        message: "Query successfully resolved, closure email dispatched, and record deleted!", 
        action: "deleted",
        id: req.params.id
      });
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ message: "Query log not found" });
    }

    res.status(200).json({ success: true, message: `Query status updated to ${status}`, data: updatedQuery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
