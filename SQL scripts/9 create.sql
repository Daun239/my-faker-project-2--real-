-- Видалення таблиць у правильному порядку
DROP TABLE IF Exists EmployeePositions;
DROP TABLE IF EXISTS ProductCheckDetails;
DROP TABLE IF EXISTS ProductChecks;
DROP TABLE IF EXISTS ProductPlacements;
DROP TABLE IF EXISTS ProductsInOrder;
DROP TABLE IF EXISTS ProductsInStorage;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS DeliveryOrders;
DROP TABLE IF EXISTS Suppliers;
DROP TABLE IF EXISTS CheckTickets;
DROP TABLE IF EXISTS Tickets;
DROP TABLE IF EXISTS Seats;
DROP TABLE IF EXISTS Screenings;
DROP TABLE IF EXISTS Runs;
DROP TABLE IF EXISTS Checks;
DROP TABLE IF EXISTS Employees;
DROP TABLE IF EXISTS Clients;
DROP TABLE IF EXISTS Halls;
DROP TABLE IF EXISTS Cinemas;
DROP TABLE IF EXISTS MoviesGenres;
DROP TABLE IF EXISTS Genres;
DROP TABLE IF EXISTS Movies;
DROP TABLE IF EXISTS Languages;
DROP TABLE IF EXISTS Countries;
DROP TABLE IF EXISTS AgeRestrictions;
DROP TABLE IF EXISTS Publishers;
DROP TABLE IF EXISTS PaymentMethods;
DROP TABLE IF EXISTS HallTechnologies;
DROP TABLE IF EXISTS ScreeningFormats;
DROP TABLE IF EXISTS Cities;
DROP TABLE IF EXISTS ProductTypes;
DROP TABLE IF EXISTS DeliveryOrderStatuses;



create table DeliveryOrderStatuses(
	DeliveryOrderStatusId int identity(1,1) primary key,
	DeliveryOrderStatus Varchar(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);


create table ProductTypes(
	ProductTypeId int identity(1,1) primary key,
	ProductType varchar(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

-- Create tables with updated CreateDateTime column to allow NULL
CREATE TABLE Publishers (
    PublisherId INT IDENTITY(1,1) PRIMARY KEY, 
    Publisher VARCHAR(255),
	CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE PaymentMethods (
    PaymentMethodId INT IDENTITY(1,1) PRIMARY KEY, 
    PaymentMethod VARCHAR(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Languages (
    LanguageId INT IDENTITY(1,1) PRIMARY KEY, 
    Language VARCHAR(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Countries (
    CountryId INT IDENTITY(1,1) PRIMARY KEY,
    Country VARCHAR(100),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE AgeRestrictions (
    AgeRestrictionId INT IDENTITY(1,1) PRIMARY KEY,
    AgeRestriction INT CHECK (AgeRestriction >= 0),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Genres (
    GenreId INT IDENTITY(1,1) PRIMARY KEY, 
    Genre VARCHAR(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE HallTechnologies (
    HallTechnologyId INT IDENTITY(1,1) PRIMARY KEY,
    HallTechnology VARCHAR(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE ScreeningFormats (
    ScreeningFormatId INT IDENTITY(1,1) PRIMARY KEY,
    ScreeningFormat VARCHAR(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Cities (
    CityId INT IDENTITY(1,1) PRIMARY KEY,
    City VARCHAR(255),
	    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Cinemas (
    CinemaId INT IDENTITY(1,1) PRIMARY KEY, 
    CityId INT,
	Name VARCHAR(255),
    Address VARCHAR(255),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (CityId) REFERENCES Cities(CityId)
);

CREATE TABLE Halls (
    HallId INT IDENTITY(1,1) PRIMARY KEY, 
    CinemaId INT NOT NULL,
    HallNumber INT CHECK (HallNumber > 0),
    HallTechnologyId INT,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (CinemaId) REFERENCES Cinemas(CinemaId),
    FOREIGN KEY (HallTechnologyId) REFERENCES HallTechnologies(HallTechnologyId)
);

CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY, 
    CinemaId INT NOT NULL,
    Name VARCHAR(255),
    Surname VARCHAR(255),
    CellNumber VARCHAR(20) UNIQUE,
    Email VARCHAR(255) UNIQUE,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (CinemaId) REFERENCES Cinemas(CinemaId)
);

CREATE TABLE Clients (
    ClientId INT IDENTITY(1,1) PRIMARY KEY, 
    Name VARCHAR(255),
    Surname VARCHAR(255),
    CellNumber VARCHAR(50) UNIQUE,
    Email VARCHAR(255) UNIQUE,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Movies (
    MovieId INT IDENTITY(1,1) PRIMARY KEY, 
	CountryId INT,
    AgeRestrictionId INT,
    PublisherId INT,
	LanguageId INT,
	Budget INT,
	Runtime INT CHECK (Runtime > 30),
    Name VARCHAR(255),
    Description TEXT,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (PublisherId) REFERENCES Publishers(PublisherId),
    FOREIGN KEY (LanguageId) REFERENCES Languages(LanguageId),
    FOREIGN KEY (CountryId) REFERENCES Countries(CountryId),
    FOREIGN KEY (AgeRestrictionId) REFERENCES AgeRestrictions(AgeRestrictionId)
);

CREATE TABLE Runs (
    RunId INT IDENTITY(1,1) PRIMARY KEY, 
	MovieId int not null,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
	foreign key (MovieId) References Movies(MovieId),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

CREATE TABLE Screenings (
    ScreeningId INT IDENTITY(1,1) PRIMARY KEY, 
    ScreeningFormatId INT,
    HallId INT not null,
    RunId INT not null,
    LanguageId INT, 
    StartDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (ScreeningFormatId) REFERENCES ScreeningFormats(ScreeningFormatId),
    FOREIGN KEY (HallId) REFERENCES Halls(HallId),
    FOREIGN KEY (RunId) REFERENCES Runs(RunId),
    FOREIGN KEY (LanguageId) REFERENCES Languages(LanguageId)
);

CREATE TABLE Seats (
    SeatId INT IDENTITY(1,1) PRIMARY KEY, 
    RowNumber INT CHECK (RowNumber > 0),
    SeatNumber INT CHECK (SeatNumber > 0),
    HallId INT NOT NULL,
    IsVipCategory BIT,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (HallId) REFERENCES Halls(HallId)
);

CREATE TABLE Checks (
    CheckId INT IDENTITY(1,1) PRIMARY KEY, 
    Sum INT CHECK (Sum >= 0),
    PaymentMethodId INT,
    EmployeeId INT NOT NULL,
    ClientId INT NOT NULL,
	BuyDateTime DateTime,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(PaymentMethodId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    FOREIGN KEY (ClientId) REFERENCES Clients(ClientId)
);

CREATE TABLE Tickets (
    TicketId INT IDENTITY(1,1) PRIMARY KEY, 
    SeatId INT NOT NULL,
	ScreeningId INT NOT NULL,
    Price INT CHECK (Price >= 0),
    Number INT CHECK (Number > 0),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (SeatId) REFERENCES Seats(SeatId),
    FOREIGN KEY (ScreeningId) REFERENCES Screenings(ScreeningId)
);

CREATE TABLE CheckTickets (
    CheckTicketId INT IDENTITY(1,1) PRIMARY KEY,
    CheckId INT NOT NULL,
    TicketId INT NOT NULL UNIQUE,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (CheckId) REFERENCES Checks(CheckId),
    FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId)
);

CREATE TABLE MoviesGenres (
    MoviesGenresId INT IDENTITY(1,1) PRIMARY KEY, 
    MovieId INT NOT NULL,
    GenreId INT NOT NULL,
    FOREIGN KEY (MovieId) REFERENCES Movies(MovieId),
    FOREIGN KEY (GenreId) REFERENCES Genres(GenreId)
);


Create Table Suppliers ( 
	SupplierId int identity(1,1) primary key,
    Name VARCHAR(255) NOT NULL,
    Surname VARCHAR(255) NOT NULL,
    CellNumber VARCHAR(50) UNIQUE,
    Email VARCHAR(255) UNIQUE,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

Create Table DeliveryOrders (
	DeliveryOrderId int identity(1,1) primary key,
	DeliveryOrderStatusId int,
	PaymentMethodId int,
	SupplierId int,
	EmployeeId int,
	Number int Check(Number > 0),
	Sum int Check(Sum >= 0),
	OrderDateTime DateTime NOT NULL,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
	foreign key (DeliveryOrderStatusId) References DeliveryOrderStatuses(DeliveryOrderStatusId),
	FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(PaymentMethodId),
	FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId),
	FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
);


CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductTypeId INT,
    Price INT Check (Price >= 0),
    Name VARCHAR(255),
    FOREIGN KEY (ProductTypeId) REFERENCES ProductTypes(ProductTypeId),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);

create table ProductsInStorage(
	ProductInStorageId int identity(1,1) primary key,
	ProductId int not null,
	CinemaId int not null,
	ProductionDate DateTime,
	ExpirationDate DateTime,
	Quantity int check(quantity >= 0),
	Foreign Key (CinemaId) References Cinemas(CinemaId),
	Foreign Key (ProductId) References Products(ProductId),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
);


CREATE TABLE ProductsInOrder (
    ProductInOrderId INT IDENTITY(1,1) PRIMARY KEY,
	ProductId int,
	DeliveryOrderId int not null,
    Quantity INT CHECK (Quantity >= 0),
    Price INT CHECK (Price >= 0),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
	foreign key (DeliveryOrderId) References DeliveryOrders(DeliveryOrderId),
	foreign key (ProductId) references Products(ProductId),
);


CREATE TABLE ProductPlacements (
    ProductPlacementId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    ProductInStorageId INT NOT NULL,
	ProductInOrderId int not null,
    PlacementDate DATETIME NOT NULL,
    Quantity INT CHECK (Quantity >= 0),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (ProductInStorageId) REFERENCES ProductsInStorage(ProductInStorageId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
	foreign key (ProductInOrderId) References ProductsInOrder(ProductInOrderId),
);

create table ProductChecks(
	ProductCheckId int identity(1,1) primary key,
	PaymentMethodId int,
	ClientId int,
	EmployeeId int,
	Number int Check(Number > 0),
	Sum int Check(Sum > 0),
	BuyTime DateTime,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
	Foreign Key (PaymentMethodId) References PaymentMethods(PaymentMethodId),
	Foreign Key (ClientId) References Clients(ClientId),
	Foreign Key (EmployeeId) References Employees(EmployeeId),
);

CREATE TABLE ProductCheckDetails (
    ProductCheckDetailId INT IDENTITY(1,1) PRIMARY KEY,
    ProductCheckId INT NOT NULL,
    ProductInStorageId INT NOT NULL,
    Quantity INT CHECK (Quantity >= 0),
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME NULL,
    FOREIGN KEY (ProductCheckId) REFERENCES ProductChecks(ProductCheckId),
    FOREIGN KEY (ProductInStorageId) REFERENCES ProductsInStorage(ProductInStorageId)
);
