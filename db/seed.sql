USE company_db;

INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('HR'), ('Marketing');

INSERT INTO role (title, salary, department_id)
VALUES 
('Sales Manager', 70000, (SELECT id FROM department WHERE name = 'Sales')),
('Software Engineer', 80000, (SELECT id FROM department WHERE name = 'Engineering')),
('HR Manager', 60000, (SELECT id FROM department WHERE name = 'HR')),
('Marketing Manager', 65000, (SELECT id FROM department WHERE name = 'Marketing'));

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('John', 'Doe', (SELECT id FROM role WHERE title = 'Sales Manager'), NULL),
('Jane', 'Smith', (SELECT id FROM role WHERE title = 'Software Engineer'), (SELECT id FROM employee WHERE first_name = 'John' AND last_name = 'Doe')),
('Alice', 'Johnson', (SELECT id FROM role WHERE title = 'HR Manager'), (SELECT id FROM employee WHERE first_name = 'John' AND last_name = 'Doe')),
('Bob', 'Brown', (SELECT id FROM role WHERE title = 'Marketing Manager'), (SELECT id FROM employee WHERE first_name = 'John' AND last_name = 'Doe'));
