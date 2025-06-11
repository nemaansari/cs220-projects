import assert from "assert";
import { Business } from "../include/data.js";
import { FluentBusinesses } from "./FluentBusinesses";

const testData: Business[] = [
  {
    business_id: "abcd",
    name: "Applebee's",
    city: "Charlotte",
    state: "NC",
    stars: 4,
    review_count: 6,
    categories: ["Food"],
    attributes: {
      Ambience: {
        classy: true,
      },
    },
  },
  {
    business_id: "abcd",
    name: "China Garden",
    state: "NC",
    city: "Charlotte",
    stars: 4,
    review_count: 10,
    categories: ["Food"],
  },
  {
    business_id: "abcd",
    name: "Beach Ventures Roofing",
    state: "AZ",
    city: "Phoenix",
    stars: 3,
    review_count: 30,
    categories: ["Construction"],
  },
  {
    business_id: "abcd",
    name: "Alpaul Automobile Wash",
    city: "Charlotte",
    state: "NC",
    stars: 3,
    review_count: 30,
    categories: ["Carwash"],
    hours: { Monday: "8:0 - 18:30" },
  },
];

describe("fromCityInState", () => {
  it("filters correctly", () => {
    const list = new FluentBusinesses(testData).fromCityInState("Charlotte", "NC").getData();

    assert(list.length === 3);
    assert(list[0].name === "Applebee's");
    assert(list[1].name === "China Garden");
    assert(list[2].name === "Alpaul Automobile Wash");
  });

  it("returns empty array when no matches found", () => {
    const list = new FluentBusinesses(testData).fromCityInState("NonExistent", "XX").getData();
    assert(list.length === 0);
  });

  it("correctly handles case sensitivity in city and state", () => {
    const list = new FluentBusinesses(testData).fromCityInState("CHARLOTTE", "NC").getData();
    assert(list.length === 0);
  });
});

describe("bestPlace", () => {
  it("filters correctly", () => {
    const list = new FluentBusinesses(testData).fromCityInState("Charlotte", "NC").getData();

    assert(list.length === 3);
    assert(list[0].name === "Applebee's");
    assert(list[1].name === "China Garden");
    assert(list[2].name === "Alpaul Automobile Wash");
  });

  it("break tie with review count", () => {
    const best = new FluentBusinesses(testData).fromCityInState("Charlotte", "NC").bestPlace();

    assert(best);
    assert(best.name === "China Garden");
  });

  it("returns undefined when no businesses exist", () => {
    const best = new FluentBusinesses([]).bestPlace();
    assert(best === undefined);
  });

  it("handles businesses with undefined stars", () => {
    const dataWithUndefinedStars: Business[] = [
      {
        business_id: "test1",
        name: "No Stars",
        city: "Test",
        state: "TS",
        categories: ["Test"],
      },
      {
        business_id: "test2",
        name: "Has Stars",
        city: "Test",
        state: "TS",
        stars: 4,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(dataWithUndefinedStars).bestPlace();
    assert(best?.name === "Has Stars");
  });

  it("should correctly handle businesses with identical stars and reviews", () => {
    const testData = [
      {
        business_id: "a1",
        name: "First Identical",
        city: "Test",
        state: "TS",
        stars: 4,
        review_count: 10,
        categories: ["Test"],
      },
      {
        business_id: "a2",
        name: "Second Identical",
        city: "Test",
        state: "TS",
        stars: 4,
        review_count: 10,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(testData).bestPlace();
    assert(best?.name === "First Identical");
  });

  it("should handle zero stars correctly", () => {
    const testData = [
      {
        business_id: "a1",
        name: "Zero Stars",
        city: "Test",
        state: "TS",
        stars: 0,
        review_count: 10,
        categories: ["Test"],
      },
      {
        business_id: "a2",
        name: "Some Stars",
        city: "Test",
        state: "TS",
        stars: 2,
        review_count: 5,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(testData).bestPlace();
    assert(best?.name === "Some Stars");
  });

  it("should keep previous best when current has fewer stars", () => {
    const testData = [
      {
        business_id: "a1",
        name: "High Stars First",
        city: "Test",
        state: "TS",
        stars: 5,
        review_count: 20,
        categories: ["Test"],
      },
      {
        business_id: "a2",
        name: "Low Stars Second",
        city: "Test",
        state: "TS",
        stars: 3,
        review_count: 40,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(testData).bestPlace();
    assert(best !== undefined);
    assert(best.name === "High Stars First");
  });

  it("should keep previous best when stars are equal but fewer reviews", () => {
    const testData = [
      {
        business_id: "a1",
        name: "Same Stars More Reviews",
        city: "Test",
        state: "TS",
        stars: 4,
        review_count: 50,
        categories: ["Test"],
      },
      {
        business_id: "a2",
        name: "Same Stars Fewer Reviews",
        city: "Test",
        state: "TS",
        stars: 4,
        review_count: 30,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(testData).bestPlace();
    assert(best !== undefined);
    assert(best.name === "Same Stars More Reviews");
  });

  it("should select first business when comparing with itself", () => {
    const singleBusiness = [
      {
        business_id: "a1",
        name: "Only Business",
        city: "Test",
        state: "TS",
        stars: 3,
        review_count: 10,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(singleBusiness).bestPlace();
    assert(best !== undefined);
    assert(best.name === "Only Business");
  });

  it("should select business with more reviews when both have equal stars", () => {
    const testData = [
      {
        business_id: "a1",
        name: "Equal Stars Fewer Reviews",
        city: "Test",
        state: "TS",
        stars: 3,
        review_count: 10,
        categories: ["Test"],
      },
      {
        business_id: "a2",
        name: "Equal Stars More Reviews",
        city: "Test",
        state: "TS",
        stars: 3,
        review_count: 20,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(testData).bestPlace();
    assert(best !== undefined);
    assert(best.name === "Equal Stars More Reviews");
  });

  it("should select second business with equal stars but more reviews during reduce", () => {
    const testData = [
      {
        business_id: "a1",
        name: "First Business",
        city: "Test",
        state: "TS",
        stars: 3,
        review_count: 10,
        categories: ["Test"],
      },
      {
        business_id: "a2",
        name: "Second Business",
        city: "Test",
        state: "TS",
        stars: 3,
        review_count: 20,
        categories: ["Test"],
      },
    ];

    const best = new FluentBusinesses(testData).bestPlace();
    assert(best !== undefined);
    assert(best.name === "Second Business");
  });

  it("should ignore NaN and undefined review counts when finding most reviews", () => {
    const data: Business[] = [
      {
        business_id: "test1",
        name: "No Reviews",
        city: "Test",
        state: "TS",
        categories: ["Test"],
        review_count: undefined as any,
      },
      {
        business_id: "test2",
        name: "Has Weird Reviews",
        city: "Test",
        state: "TS",
        categories: ["Test"],
        review_count: NaN,
      },
      {
        business_id: "test3",
        name: "Valid Reviews",
        city: "Test",
        state: "TS",
        categories: ["Test"],
        review_count: 5,
      },
    ];
  
    const result = new FluentBusinesses(data).mostReviews();
    assert(result !== undefined);
    assert.strictEqual(result.name, "Valid Reviews");
  });
  
});

describe("hasStarsGeq", () => {
  it("Should correctly filter businesses with stars given", () => {
    const business = new FluentBusinesses(testData).hasStarsGeq(4).getData();

    assert(business.length === 2);
    assert(business[0].name === "Applebee's");
    assert(business[1].name === "China Garden");
  });

  it("should handle businesses with undefined stars", () => {
    const dataWithUndefinedStars: Business[] = [
      ...testData,
      {
        business_id: "test",
        name: "No Stars",
        city: "Test",
        state: "TS",
        categories: ["Test"],
      },
    ];

    const business = new FluentBusinesses(dataWithUndefinedStars).hasStarsGeq(1).getData();
    assert(business.length === 4);
  });

  it("should return empty array when no businesses meet criteria", () => {
    const business = new FluentBusinesses(testData).hasStarsGeq(5).getData();
    assert(business.length === 0);
  });
});

describe("inCategory", () => {
  it("Should correctly filter businesses with given category", () => {
    const business = new FluentBusinesses(testData).inCategory("Food").getData();

    assert(business.length === 2);
    assert(business[0].categories !== undefined && business[0].categories.includes("Food"));
    assert(business[1].categories !== undefined && business[1].categories.includes("Food"));
  });

  it("should handle undefined categories array", () => {
    const dataWithUndefinedCategories: Business[] = [
      ...testData,
      {
        business_id: "test",
        name: "No Categories",
        city: "Test",
        state: "TS",
        stars: 4,
      },
    ];

    const business = new FluentBusinesses(dataWithUndefinedCategories).inCategory("Test").getData();
    assert(business.length === 0);
  });
});

describe("hasHoursOnDays", () => {
  it("Should find hours on specific day provided", () => {
    const business = new FluentBusinesses(testData).hasHoursOnDays(["Monday"]).getData();
    assert(business.length === 1);
    assert(business[0].hours !== undefined && business[0].name === "Alpaul Automobile Wash");
  });

  it("should handle multiple days requirement", () => {
    const dataWithMultipleDays: Business[] = [
      ...testData,
      {
        business_id: "test",
        name: "Multiple Days",
        city: "Test",
        state: "TS",
        categories: ["Test"],
        hours: {
          Monday: "9:00 - 17:00",
          Tuesday: "9:00 - 17:00",
        },
      },
    ];

    const business = new FluentBusinesses(dataWithMultipleDays).hasHoursOnDays(["Monday", "Tuesday"]).getData();
    assert(business.length === 1);
    assert(business[0].name === "Multiple Days");
  });

  it("should return empty array when no businesses have all required days", () => {
    const business = new FluentBusinesses(testData).hasHoursOnDays(["Friday", "Saturday"]).getData();
    assert(business.length === 0);
  });

  it("should work with empty days array", () => {
    const business = new FluentBusinesses(testData).hasHoursOnDays([]).getData();
    assert(business.length === 4);
  });

});

describe("hasAmbience", () => {
  it("Should filter business with correct ambience", () => {
    const business = new FluentBusinesses(testData).hasAmbience("classy").getData();

    assert(business.length === 1);
    assert(business[0].name === "Applebee's");
  });

  it("should handle non-existent ambience", () => {
    const business = new FluentBusinesses(testData).hasAmbience("romantic").getData();
    assert(business.length === 0);
  });

  it("should handle undefined attributes", () => {
    const business = new FluentBusinesses([
      {
        business_id: "test",
        name: "No Attributes",
        city: "Test",
        state: "TS",
        categories: ["Test"],
      },
    ])
      .hasAmbience("any")
      .getData();

    assert(business.length === 0);
  });

  it("should handle ambience with false value", () => {
    const dataWithFalseAmbience: Business[] = [
      ...testData,
      {
        business_id: "test",
        name: "False Ambience",
        city: "Test",
        state: "TS",
        categories: ["Test"],
        attributes: {
          Ambience: {
            romantic: false,
          },
        },
      },
    ];

    const business = new FluentBusinesses(dataWithFalseAmbience).hasAmbience("romantic").getData();
    assert(business.length === 0);
  });
});

describe("mostReviews", () => {
  it("Should find business with most reviews", () => {
    const business = new FluentBusinesses(testData).mostReviews();
    assert(business !== undefined && business.name === "Beach Ventures Roofing");
  });

  it("should return undefined for empty data", () => {
    const business = new FluentBusinesses([]).mostReviews();
    assert(business === undefined);
  });

  it("should handle undefined review counts", () => {
    const dataWithUndefinedReviews: Business[] = [
      {
        business_id: "test1",
        name: "No Reviews",
        city: "Test",
        state: "TS",
        categories: ["Test"],
      },
      {
        business_id: "test2",
        name: "Has Reviews",
        city: "Test",
        state: "TS",
        review_count: 10,
        categories: ["Test"],
      },
    ];

    const business = new FluentBusinesses(dataWithUndefinedReviews).mostReviews();
    assert(business?.name === "Has Reviews");
  });

  it("should ignore businesses with NaN or non-numeric review counts", () => {
    const data: Business[] = [
      {
        business_id: "a",
        name: "Weird Reviews",
        review_count: NaN,
        city: "X",
        state: "Y",
        categories: ["Test"],
      },
      {
        business_id: "b",
        name: "Valid Reviews",
        review_count: 5,
        city: "X",
        state: "Y",
        categories: ["Test"],
      },
    ];

    const result = new FluentBusinesses(data).mostReviews();
    assert(result !== undefined);
  });
});

describe("method chaining", () => {
  it("should support chaining multiple filters", () => {
    const business = new FluentBusinesses(testData).fromCityInState("Charlotte", "NC").hasStarsGeq(4).getData();

    assert(business.length === 2);
    assert(business[0].name === "Applebee's");
    assert(business[1].name === "China Garden");
  });

  it("should support complex chains with multiple filters", () => {
    const result = new FluentBusinesses(testData)
      .fromCityInState("Charlotte", "NC")
      .hasStarsGeq(3)
      .inCategory("Carwash")
      .getData();

    assert(result.length === 1);
    assert(result[0].name === "Alpaul Automobile Wash");
  });

  it("should return empty array when chained filters produce no matches", () => {
    const result = new FluentBusinesses(testData).fromCityInState("Charlotte", "NC").hasStarsGeq(5).getData();

    assert(result.length === 0);
  });
});
