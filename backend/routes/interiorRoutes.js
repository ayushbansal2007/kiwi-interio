const express=require("express") // Importing Express framework
const router=express.Router(); // Creating a router instance

const Interior=require("../models/InteriorModel")// importing the Interior model
const authMiddleware = require("../middleware/authMiddleware");
const rolesMiddleware = require("../middleware/roleMiddleware");


router.get("/interiors",async(req,res)=>{
    try{
        const interiors=await Interior.find().lean(); //x` Fetching all interior items from the database
        res.json(interiors); // Sending the fetched interiors as a JSON response
    }
    catch(err){
        console.error("Error fetching interiors",err);
        res.status(500).json({message:"Server error"}) // Sending a 500 status code with an error message in case of failure
    }
})

router.put(
  "/interior/:id",
  authMiddleware,
  rolesMiddleware("admin"),

  async (req, res) => {
    try {
      const updatedInterior =
        await Interior.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );

      res.json(updatedInterior);
    } catch (err) {
      console.error("Error updating interior", err);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports=router; 