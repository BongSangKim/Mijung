from app.databases.database import engineconn

def test_db_connection():
    # Create an instance of engineconn
    db_engine = engineconn()

    # Use the connection method to attempt a simple query
    with db_engine.connection() as conn:
        try:
            # Execute a test query
            result = conn.execute("SELECT 1")

            # Fetch the result to verify the connection
            for row in result:
                print(f"Connection successful, result: {row[0]}")
                
            # You could also test by selecting a specific table
            # e.g., result = conn.execute("SELECT * FROM users LIMIT 1")
            # and fetch results to verify
            
        except Exception as e:
            # Print exception if something goes wrong
            print(f"Error during connection test: {e}")


# Call the function to test
test_db_connection()
