-- ১. মেম্বারদের টেবিল (Users)
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    total_deposit DECIMAL(10,2) DEFAULT 0.00,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ২. মিলের হিসাবের টেবিল (Meals)
CREATE TABLE Meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    meal_date DATE NOT NULL,
    lunch_count DECIMAL(3,1) DEFAULT 0,
    dinner_count DECIMAL(3,1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- ৩. বাজার খরচের টেবিল (Expenses)
CREATE TABLE Expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    expense_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);