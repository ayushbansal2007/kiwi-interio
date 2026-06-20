
const Interior =
  require(
    "../../models/interiorModel"
  );

async function searchInteriorTool({
  category,
  budget,
  style,
}) {
  try {

    const filters =
      [];

    // CATEGORY SEARCH
    if (category) {

      const cleanCategory =
        category
          .trim()
          .toLowerCase();

      const exactRegex =
        new RegExp(
          `^${cleanCategory}$`,
          "i"
        );

      const partialRegex =
        new RegExp(
          cleanCategory,
          "i"
        );

      filters.push({

        $or: [

          // exact category
          {
            category:
              exactRegex,
          },

          // exact subcategory
          {
            subcategory:
              exactRegex,
          },

          // room type
          {
            roomType:
              exactRegex,
          },

          // exact tags
          {
            tags: {
              $elemMatch:
                {
                  $regex:
                    exactRegex,
                },
            },
          },

          // title search
          {
            title: {
              $regex:
                partialRegex,
            },
          },

          // description search
          {
            description:
              {
                $regex:
                  partialRegex,
              },
          },
        ],
      });
    }

    // STYLE SEARCH
    if (style) {

      const cleanStyle =
        style
          .trim()
          .toLowerCase();

      const styleRegex =
        new RegExp(
          cleanStyle,
          "i"
        );

      filters.push({

        $or: [

          {
            style:
              styleRegex,
          },

          {
            tags: {
              $elemMatch:
                {
                  $regex:
                    styleRegex,
                },
            },
          },
        ],
      });
    }

    // BUDGET FILTER
    if (
      budget &&
      budget > 0
    ) {

      filters.push({

        price: {
          $lte:
            budget,
        },
      });
    }

    // FINAL QUERY
    const query =
      filters.length
        ? {
            $and:
              filters,
          }
        : {};

    console.log(
      "SEARCH QUERY:",
      JSON.stringify(
        query,
        null,
        2
      )
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
      "FOUND ITEMS:",
      items.map(
        (item) => ({
          title:
            item.title,
          category:
            item.category,
          price:
            item.price,
        })
      )
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

    console.error(
      "SEARCH ERROR:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

module.exports =
  searchInteriorTool;
