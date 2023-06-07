const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 330,
    user: 'root',
    password: 'MyPassword', // replace 'your_mysql_password' with your actual MySQL password
    database: 'company_db'
});
connection.connect((err) => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    init();
});

function init() {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployeeRole();
                    break;
                default:
                    connection.end();
                    break;
            }
        });
}

// Place functions to viewAllDepartments, viewAllRoles, viewAllEmployees, addDepartment, addRole, addEmployee, updateEmployeeRole here. 
function viewAllDepartments() {
    console.log('Viewing all departments...\n');
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
}

function viewAllRoles() {
    console.log('Viewing all roles...\n');
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
}

function viewAllEmployees() {
    console.log('Viewing all employees...\n');
    connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
}

function addDepartment() {
    console.log('Adding a department...\n');
    inquirer
        .prompt({
            name: 'department',
            type: 'input',
            message: 'What is the name of the department?',
        })
        .then((answer) => {
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: answer.department,
                },
                (err) => {
                    if (err) throw err;
                    console.log('Your department was created successfully!');
                    init();
                }
            );
        });
}

function addRole() {
    console.log('Adding a role...\n');

    // First fetch all the departments
    connection.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        // Now departments are available here, create the prompts
        inquirer
            .prompt([
                {
                    name: 'title',
                    type: 'input',
                    message: 'What is the title of the role?',
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of the role?',
                },
                {
                    name: 'department_id',
                    type: 'list',
                    message: 'What is the department of the role?',
                    // Generate choices from the departments
                    choices: departments.map(department => ({ name: department.name, value: department.id }))
                },
            ])
            .then((answer) => {
                connection.query(
                    'INSERT INTO role SET ?',
                    {
                        title: answer.title,
                        salary: answer.salary,
                        department_id: answer.department_id,
                    },
                    (err) => {
                        if (err) throw err;
                        console.log('Your role was created successfully!');
                        init();
                    }
                );
            });
    });
}

function addEmployee() {
    console.log('Adding an employee...\n');
    inquirer
        .prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'What is the first name of the employee?',
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'What is the last name of the employee?',
            },
            {
                name: 'role_id',
                type: 'input',
                message: 'What is the role id of the employee?',
            },
            {
                name: 'manager_id',
                type: 'input',
                message: 'What is the manager id of the employee?',
            },
        ])
        .then((answer) => {
            connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id,
                },
                (err) => {
                    if (err) throw err;
                    console.log('Your employee was created successfully!');
                    init();
                }
            );
        });
}

function updateEmployeeRole() {
    console.log('Updating an employee role...\n');
    inquirer
        .prompt([
            {
                name: 'employee_id',
                type: 'input',
                message: 'What is the id of the employee?',
            },
            {
                name: 'role_id',
                type: 'input',
                message: 'What is the new role id of the employee?',
            },
        ])
        .then((answer) => {
            connection.query(
                'UPDATE employee SET ? WHERE ?',
                [
                    {
                        role_id: answer.role_id,
                    },
                    {
                        id: answer.employee_id,
                    },
                ],
                (err) => {
                    if (err) throw err;
                    console.log('Your employee role was updated successfully!');
                    init();
                }
            );
        });
}

