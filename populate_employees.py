import asyncio
import random
from datetime import date, timedelta

first_names = ['Arun','Karthik','Vignesh','Saravanan','Pradeep','Harish','Dinesh','Senthil','Naveen','Gokul','Suresh','Ramesh','Murugan','Balaji','Vijay','Ajith','Ragul','Manikandan','Ashwin','Kishore']
last_names = ['Kumar','Raj','Subramanian','Narayanan','Raman','Krishnan','Babu','Balaji','Iyer','Nair','Mohan','Vel','Selvan','Prakash','Anand','Sankar','Reddy','Pillai','Mani','Shankar']
departments = ['IT','HR','Finance','Exploration','Drilling','Production','Maintenance','Safety']
designations = ['Engineer','Senior Engineer','Deputy Manager','Manager','Lead Engineer','Analyst','Administrator','HR Executive','Finance Officer','Geologist']
grades = ['E1','E2','E3','E4','E5']
locations = ['Chennai','Karaikal','Nagapattinam','Neyveli','Coimbatore','Madurai']

employees = []
for i in range(1, 101):
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    doj = date.today() - timedelta(days=random.randint(0, 3000))
    emp = {
        'emp_code': f"ONGC{i:04d}",
        'first_name': fn,
        'last_name': ln,
        'username': f"{fn}{i}".lower(),
        'email': f"{fn}{i}@ongc.co.in".lower(),
        'mobile': f"98{random.randint(0, 99999999):08d}",
        'designation': random.choice(designations),
        'department': random.choice(departments),
        'grade': random.choice(grades),
        'location': random.choice(locations),
        'reporting_manager': f"Manager {i}",
        'date_of_joining': doj.isoformat(),
        'role': 'USER'
    }
    employees.append(emp)

async def populate_postgres():
    import asyncpg
    try:
        conn = await asyncpg.connect(
            host='postgres', port=5432, user='vanna_user', password='vanna_pass', database='vanna_db'
        )
        await conn.execute("DROP TABLE IF EXISTS employees;")
        await conn.execute("""
            CREATE TABLE employees (
                emp_code VARCHAR(20) PRIMARY KEY,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                username VARCHAR(255),
                email VARCHAR(255),
                mobile VARCHAR(20),
                designation VARCHAR(255),
                department VARCHAR(255),
                grade VARCHAR(50),
                location VARCHAR(255),
                reporting_manager VARCHAR(255),
                date_of_joining DATE,
                role VARCHAR(50)
            );
        """)
        
        for emp in employees:
            await conn.execute("""
                INSERT INTO employees (emp_code, first_name, last_name, username, email, mobile, designation, department, grade, location, reporting_manager, date_of_joining, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            """, emp['emp_code'], emp['first_name'], emp['last_name'], emp['username'], emp['email'], emp['mobile'], emp['designation'], emp['department'], emp['grade'], emp['location'], emp['reporting_manager'], date.fromisoformat(emp['date_of_joining']), emp['role'])
        await conn.close()
        print("PostgreSQL populated")
    except Exception as e:
        print(f"PostgreSQL error: {e}")

async def populate_mysql():
    import aiomysql
    try:
        conn = await aiomysql.connect(
            host='mysql-test', port=3306, user='root', password='mysql_pass', db='test_db'
        )
        async with conn.cursor() as cur:
            await cur.execute("DROP TABLE IF EXISTS employees;")
            await cur.execute("""
                CREATE TABLE employees (
                    emp_code VARCHAR(20) PRIMARY KEY,
                    first_name VARCHAR(255),
                    last_name VARCHAR(255),
                    username VARCHAR(255),
                    email VARCHAR(255),
                    mobile VARCHAR(20),
                    designation VARCHAR(255),
                    department VARCHAR(255),
                    grade VARCHAR(50),
                    location VARCHAR(255),
                    reporting_manager VARCHAR(255),
                    date_of_joining DATE,
                    role VARCHAR(50)
                );
            """)
            for emp in employees:
                await cur.execute("""
                    INSERT INTO employees (emp_code, first_name, last_name, username, email, mobile, designation, department, grade, location, reporting_manager, date_of_joining, role)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (emp['emp_code'], emp['first_name'], emp['last_name'], emp['username'], emp['email'], emp['mobile'], emp['designation'], emp['department'], emp['grade'], emp['location'], emp['reporting_manager'], emp['date_of_joining'], emp['role']))
        await conn.commit()
        conn.close()
        print("MySQL populated")
    except Exception as e:
        print(f"MySQL error: {e}")

async def populate_mongodb():
    import motor.motor_asyncio
    try:
        uri = "mongodb://mongo_user:mongo_pass@mongodb-test:27017/test_db?authSource=admin"
        client = motor.motor_asyncio.AsyncIOMotorClient(uri)
        db = client['test_db']
        await db.employees.drop()
        await db.employees.insert_many(employees)
        print("MongoDB populated")
    except Exception as e:
        print(f"MongoDB error: {e}")

def populate_oracle():
    import oracledb
    try:
        # Default database for oracle-free container is FREEPDB1
        dsn = "oracle-test:1521/FREEPDB1"
        with oracledb.connect(user="SYSTEM", password="oracle_pass", dsn=dsn) as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute("DROP TABLE employees")
                except oracledb.DatabaseError as e:
                    pass
                cur.execute("""
                    CREATE TABLE employees (
                        emp_code VARCHAR2(20) PRIMARY KEY,
                        first_name VARCHAR2(255),
                        last_name VARCHAR2(255),
                        username VARCHAR2(255),
                        email VARCHAR2(255),
                        mobile VARCHAR2(20),
                        designation VARCHAR2(255),
                        department VARCHAR2(255),
                        grade VARCHAR2(50),
                        location VARCHAR2(255),
                        reporting_manager VARCHAR2(255),
                        date_of_joining DATE,
                        role VARCHAR2(50)
                    )
                """)
                for emp in employees:
                    cur.execute("""
                        INSERT INTO employees (emp_code, first_name, last_name, username, email, mobile, designation, department, grade, location, reporting_manager, date_of_joining, role)
                        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, TO_DATE(:12, 'YYYY-MM-DD'), :13)
                    """, (emp['emp_code'], emp['first_name'], emp['last_name'], emp['username'], emp['email'], emp['mobile'], emp['designation'], emp['department'], emp['grade'], emp['location'], emp['reporting_manager'], emp['date_of_joining'], emp['role']))
            conn.commit()
        print("Oracle populated")
    except Exception as e:
        print(f"Oracle error: {e}")

async def main():
    await populate_postgres()
    await populate_mysql()
    await populate_mongodb()
    import concurrent.futures
    loop = asyncio.get_running_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, populate_oracle)

if __name__ == '__main__':
    asyncio.run(main())
