
const Interior =
 require(
  "../../models/InteriorModel"
);

async function priceTool({
 category,
 budget,
}) {

 try {

  const query = {};

  // budget
  if (
   budget > 0
  ) {

   query.price = {
    $lte:
      budget,
   };
  }

  // category
  if (
   category
  ) {

   const regex =
    new RegExp(
      category,
      "i"
    );

   query.$or = [

    {
      category:
        regex,
    },

    {
      subcategory:
        regex,
    },

    {
      roomType:
        regex,
    },

    {
      tags: {
       $in: [
        regex,
       ],
      },
    },

    {
      title: {
       $regex:
        regex,
      },
    },
   ];
  }

  console.log(
   "PRICE QUERY:",
   query
  );

  const items =
   await Interior.find(
    query
   )
    .sort({
      price: 1,
    })
    .limit(4);

  console.log(
   "PRICE ITEMS:",
   items
  );

  return {
   found:
    items.length >
    0,
   items,
  };

 } catch (
  error
 ) {

  throw new Error(
   error.message
  );
 }
}

module.exports =
 priceTool;

