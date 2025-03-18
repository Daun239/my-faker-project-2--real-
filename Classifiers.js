const AgeRestrictions = [
  { AgeRestrictionsId: 1, AgeRestriction: 0 },  // General Audience
  { AgeRestrictionsId: 2, AgeRestriction: 6 }, // Parental Guidance
  { AgeRestrictionsId: 3, AgeRestriction: 13 }, // Parents Strongly Cautioned
  { AgeRestrictionsId: 4, AgeRestriction: 16 }, // Restricted
  { AgeRestrictionsId: 5, AgeRestriction: 18 } // Adults Only
];

const HallTechnologies = [
  { HallTechnologiesId: 1, HallTechnology: 'IMAX' },
  { HallTechnologiesId: 2, HallTechnology: '3D' },
  { HallTechnologiesId: 3, HallTechnology: '4DX' },
  { HallTechnologiesId: 4, HallTechnology: 'Dolby Atmos' },
  { HallTechnologiesId: 5, HallTechnology: 'Standard' }
];

const ScreeningFormats = [
  { ScreeningFormatsId: 1, ScreeningFormat: 'Digital' },
  { ScreeningFormatsId: 2, ScreeningFormat: '35mm' },
  { ScreeningFormatsId: 3, ScreeningFormat: '70mm' },
  { ScreeningFormatsId: 4, ScreeningFormat: 'Blu-ray' },
  { ScreeningFormatsId: 5, ScreeningFormat: 'DCP' } // Digital Cinema Package
];

const PaymentMethods = [
  { PaymentMethodsId: 1, PaymentMethod: 'Credit Card' },
  { PaymentMethodsId: 2, PaymentMethod: 'Debit Card' },
  { PaymentMethodsId: 3, PaymentMethod: 'PayPal' },
  { PaymentMethodsId: 4, PaymentMethod: 'Bank Transfer' },
  { PaymentMethodsId: 5, PaymentMethod: 'Cash' },
  { PaymentMethodsId: 6, PaymentMethod: 'Mobile Payment' },
  { PaymentMethodsId: 7, PaymentMethod: 'Gift Card' }
];

const Cities = [
  { City: 'Kyiv', CitiesId: 1, },
  { City: 'Paris', CitiesId: 2, },
  { City: 'Tokyo', CitiesId: 3, },
  { City: 'Berlin', CitiesId: 4, },
  { City: 'Sydney', CitiesId: 5, },
];

const CinemaNames = [
  "Luminex Cinemas",
  "Starlight Screens",
  "Cineverse",
  "SilverScope Theaters",
  "Eclipse Cinema",
  "Aurora Pictures",
  "Infinity Reel",
  "VelvetView",
  "Nova Cinemas",
  "The Panorama"
];

const DeliveryOrderStatuses = Object.freeze([
  { DeliveryOrderStatusId: 1, DeliveryOrderStatus: "Ordered" },     // Замовлено у постачальника
  { DeliveryOrderStatusId: 2, DeliveryOrderStatus: "Shipped" },     // Відправлено постачальником
  { DeliveryOrderStatusId: 3, DeliveryOrderStatus: "Delivered" },   // Доставлено до кінотеатру
  { DeliveryOrderStatusId: 4, DeliveryOrderStatus: "Cancelled" },   // Скасовано до доставки
  { DeliveryOrderStatusId: 5, DeliveryOrderStatus: "Returned" }     // Повернуто постачальнику
]);


const ProductTypes = [
  { ProductType: "Popcorn", ProductTypeId: 1 },       // Standard movie snack
  { ProductType: "Nachos", ProductTypeId: 2 },        // Nachos with cheese or other toppings
  { ProductType: "Candy", ProductTypeId: 3 },         // Various types of sweets, chocolates
  { ProductType: "Soda", ProductTypeId: 4 },         // Soft drinks like cola, lemonade, etc.
  { ProductType: "Juice", ProductTypeId: 5 },        // Fruit juices or smoothies
  { ProductType: "Ice Cream", ProductTypeId: 6 },    // Frozen dessert, often served in cups or cones
  { ProductType: "Hot Dog", ProductTypeId: 7 },      // Popular fast food snack in cinemas
  { ProductType: "Merchandise", ProductTypeId: 8 },  // Movie-themed merchandise like T-shirts, posters, etc.
  { ProductType: "Coffee", ProductTypeId: 9 },       // Coffee drinks
  { ProductType: "Water", ProductTypeId: 10 },       // Bottled water or sparkling water
  { ProductType: "Frozen Yogurt", ProductTypeId: 11 } // Frozen yogurt with toppings
];

module.exports = {
  AgeRestrictions,
  HallTechnologies,
  ScreeningFormats,
  PaymentMethods,
  Cities,
  CinemaNames,
  DeliveryOrderStatuses,
  ProductTypes
};