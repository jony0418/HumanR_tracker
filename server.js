const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost', // Change to your MySQL host if required
    port: 330, // Change to your MySQL port if required
    user: 'root', 
    password: 'MyPassword', // Change to your MySQL password
    database: 'company_db' 
});
connection.connect((err) => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    init();
});

// This function will display the menu of actions that the user can take
// It will then call the appropriate function based on the user's choice
function init() {
    inquirer.prompt({
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
            'Update an employee manager',
            'View employees by manager',
            'View employees by department',
            'Delete a department',
            'Delete a role',
            'Delete an employee',
            'View the total utilized budget of a department',
            'Exit',
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
            case 'Update an employee manager':
                updateEmployeeManager();
                break;
            case 'View employees by manager':
                viewEmployeesByManager();
                break;
            case 'View employees by department':
                viewEmployeesByDepartment();
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete an employee':
                deleteEmployee();
                break;
            case 'View the total utilized budget of a department':
                viewDepartmentBudget();
                break;
            case 'Exit':
                connection.end();
                break;
            default:
                console.log(`Invalid action: ${answer.action}`);
                init();
                break;
        }
    });
}

// Here are the functions that will be called when the user selects an action from the menu
// Each function will be responsible for getting the data from the user and then executing the query
// The init() function will then be called again to display the menu again

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
    let roleChoices;
    let managerChoices;

    connection.promise().query('SELECT * FROM role')
        .then(([rows, fields]) => {
            roleChoices = rows.map(row => ({ name: row.title, value: row.id }));
            return connection.promise().query('SELECT * FROM employee');
        })
        .then(([rows, fields]) => {
            managerChoices = rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
            managerChoices.push({ name: "None", value: null }); //Adding null option
            return inquirer.prompt([
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
                    type: 'list',
                    message: 'What is the role of the employee?',
                    choices: roleChoices
                },
                {
                    name: 'manager_id',
                    type: 'list',
                    message: 'Who is the manager of the employee?',
                    choices: managerChoices
                },
            ])
        })
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
    let employeeChoices;
    let roleChoices;

    connection.promise().query('SELECT * FROM employee')
        .then(([rows, fields]) => {
            employeeChoices = rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
            return connection.promise().query('SELECT * FROM role');
        })
        .then(([rows, fields]) => {
            roleChoices = rows.map(row => ({ name: row.title, value: row.id }));
            return inquirer.prompt([
                {
                    name: 'employee_id',
                    type: 'list',
                    message: 'Which employee\'s role do you want to update?',
                    choices: employeeChoices
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: 'What is the new role of the employee?',
                    choices: roleChoices
                },
            ])
        })
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

// Here I added the bonus function to update the manager of an employee
// I used the same logic as the updateEmployeeRole function
function updateEmployeeManager() {
    console.log('Updating an employee manager...\n');
    let employeeChoices;
    let managerChoices;

    connection.promise().query('SELECT * FROM employee')
        .then(([rows, fields]) => {
            employeeChoices = rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
            managerChoices = [...employeeChoices]; 
            managerChoices.push({ name: "None", value: null }); //Adding null option
            return inquirer.prompt([
                {
                    name: 'employee_id',
                    type: 'list',
                    message: 'Which employee\'s manager do you want to update?',
                    choices: employeeChoices
                },
                {
                    name: 'manager_id',
                    type: 'list',
                    message: 'Who is the new manager of the employee?',
                    choices: managerChoices
                },
            ])
        })
        .then((answer) => {
            connection.query(
                'UPDATE employee SET ? WHERE ?',
                [
                    {
                        manager_id: answer.manager_id,
                    },
                    {
                        id: answer.employee_id,
                    },
                ],
                (err) => {
                    if (err) throw err;
                    console.log('Your employee\'s manager was updated successfully!');
                    init();
                }
            );
        });
}

function viewEmployeesByManager() {
    console.log('Viewing all employees by manager...\n');
    connection.query('SELECT e1.first_name AS employee_first_name, e1.last_name AS employee_last_name, e2.first_name AS manager_first_name, e2.last_name AS manager_last_name FROM employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id ORDER BY e2.first_name, e2.last_name', (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
}

function viewEmployeesByDepartment() {
    console.log('Viewing all employees by department...\n');
    connection.query('SELECT employee.first_name, employee.last_name, department.name AS department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY department.name', (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
}

// Here for the rest of the funtions I used the same Logic with the fetch
// This funtions uptdate, delete and update the tables of the database
function deleteDepartment() {
    console.log('Deleting a department...\n');
    let departmentChoices;

    connection.promise().query('SELECT * FROM department')
        .then(([rows, fields]) => {
            departmentChoices = rows.map(row => ({ name: row.name, value: row.id }));
            return inquirer.prompt([
                {
                    name: 'department_id',
                    type: 'list',
                    message: 'Which department do you want to delete?',
                    choices: departmentChoices
                },
            ])
        })
        .then((answer) => {
            connection.query(
                'DELETE FROM department WHERE ?',
                {
                    id: answer.department_id,
                },
                (err) => {
                    if (err) throw err;
                    console.log('The department was deleted successfully!');
                    init();
                }
            );
        });
}

function deleteRole() {
    console.log('Deleting a role...\n');
    let roleChoices;

    connection.promise().query('SELECT * FROM role')
        .then(([rows, fields]) => {
            roleChoices = rows.map(row => ({ name: row.title, value: row.id }));
            return inquirer.prompt([
                {
                    name: 'role_id',
                    type: 'list',
                    message: 'Which role do you want to delete?',
                    choices: roleChoices
                },
            ])
        })
        .then((answer) => {
            connection.query(
                'DELETE FROM role WHERE ?',
                {
                    id: answer.role_id,
                },
                (err) => {
                    if (err) throw err;
                    console.log('The role was deleted successfully!');
                    init();
                }
            );
        });
}

function deleteEmployee() {
    console.log('Deleting an employee...\n');
    let employeeChoices;

    connection.promise().query('SELECT * FROM employee')
        .then(([rows, fields]) => {
            employeeChoices = rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
            return inquirer.prompt([
                {
                    name: 'employee_id',
                    type: 'list',
                    message: 'Which employee do you want to delete?',
                    choices: employeeChoices
                },
            ])
        })
        .then((answer) => {
            connection.query(
                'DELETE FROM employee WHERE ?',
                {
                    id: answer.employee_id,
                },
                (err) => {
                    if (err) throw err;
                    console.log('The employee was deleted successfully!');
                    init();
                }
            );
        });
}

// Here I added the bonus function to view the total budget of a department
function viewDepartmentBudget() {
    console.log('Viewing total utilized budget of a department...\n');
    let departmentChoices;

    connection.promise().query('SELECT * FROM department')
        .then(([rows, fields]) => {
            departmentChoices = rows.map(row => ({ name: row.name, value: row.id }));
            return inquirer.prompt([
                {
                    name: 'department_id',
                    type: 'list',
                    message: 'For which department do you want to view the total utilized budget?',
                    choices: departmentChoices
                },
            ])
        })
        .then((answer) => {
            connection.query(
                'SELECT department.name AS department, SUM(role.salary) AS total_budget FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.id = ?',
                [answer.department_id],
                (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    init();
                }
            );
        });
}
