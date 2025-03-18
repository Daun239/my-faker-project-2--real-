-- Видаляємо залежні таблиці
DELETE FROM ProductsInOrder;
DELETE FROM ProductsInStorage;
DELETE FROM CheckTickets;
DELETE FROM Tickets;
DELETE FROM Checks;
DELETE FROM Screenings;
DELETE FROM Runs;
DELETE FROM MoviesGenres;
DELETE FROM DeliveryOrders;

-- Видаляємо менш залежні таблиці
DELETE FROM Movies;
DELETE FROM Halls;
DELETE FROM Seats;
DELETE FROM Employees;
DELETE FROM Clients;
DELETE FROM Cinemas;

-- Видаляємо незалежні таблиці
DELETE FROM HallTechnologies;
DELETE FROM ScreeningFormats;
DELETE FROM Languages;
DELETE FROM Countries;
DELETE FROM AgeRestrictions;
DELETE FROM Genres;
DELETE FROM PaymentMethods;
DELETE FROM Publishers;
DELETE FROM Cities;



-- Скидання лічильників ідентифікаторів для всіх таблиць
DBCC CHECKIDENT ('DeliveryOrderStatuses', RESEED, 0);
DBCC CHECKIDENT ('ProductTypes', RESEED, 0);
DBCC CHECKIDENT ('Publishers', RESEED, 0);
DBCC CHECKIDENT ('PaymentMethods', RESEED, 0);
DBCC CHECKIDENT ('Languages', RESEED, 0);
DBCC CHECKIDENT ('Countries', RESEED, 0);
DBCC CHECKIDENT ('AgeRestrictions', RESEED, 0);
DBCC CHECKIDENT ('Genres', RESEED, 0);
DBCC CHECKIDENT ('HallTechnologies', RESEED, 0);
DBCC CHECKIDENT ('ScreeningFormats', RESEED, 0);
DBCC CHECKIDENT ('Cities', RESEED, 0);
DBCC CHECKIDENT ('Cinemas', RESEED, 0);
DBCC CHECKIDENT ('Halls', RESEED, 0);
DBCC CHECKIDENT ('Employees', RESEED, 0);
DBCC CHECKIDENT ('Clients', RESEED, 0);
DBCC CHECKIDENT ('Movies', RESEED, 0);
DBCC CHECKIDENT ('Runs', RESEED, 0);
DBCC CHECKIDENT ('Screenings', RESEED, 0);
DBCC CHECKIDENT ('Seats', RESEED, 0);
DBCC CHECKIDENT ('Checks', RESEED, 0);
DBCC CHECKIDENT ('Tickets', RESEED, 0);
DBCC CHECKIDENT ('CheckTickets', RESEED, 0);
DBCC CHECKIDENT ('MoviesGenres', RESEED, 0);
DBCC CHECKIDENT ('Suppliers', RESEED, 0);
DBCC CHECKIDENT ('DeliveryOrders', RESEED, 0);
DBCC CHECKIDENT ('Products', RESEED, 0);
DBCC CHECKIDENT ('ProductsInStorage', RESEED, 0);
DBCC CHECKIDENT ('ProductsInOrder', RESEED, 0);
DBCC CHECKIDENT ('ProductPlacements', RESEED, 0);
DBCC CHECKIDENT ('ProductChecks', RESEED, 0);
DBCC CHECKIDENT ('ProductCheckDetails', RESEED, 0);
