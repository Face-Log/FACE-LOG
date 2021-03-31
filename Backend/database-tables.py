# creating the tables for database
import sqlite3

conn = sqlite3.connect('Database/final.db')
cursor = conn.cursor()

cursor.execute(""" CREATE TABLE IF NOT EXISTS cust_image_master (Customer_ID VARCHAR(10) PRIMARY KEY, Image BLOB, Counter INTEGER) """)
cursor.execute(""" CREATE TABLE IF NOT EXISTS location_master (Location_ID VARCHAR(10) PRIMARY KEY, Location_Name TEXT) """)

cursor.execute(""" CREATE TABLE IF NOT EXISTS customer_master (Customer_ID VARCHAR(10) PRIMARY KEY, Gender CHARACTER, Age INTEGER, Counter INTEGER) """)


cursor.execute(""" CREATE TABLE IF NOT EXISTS visit_register (Visit_Date DATE, Visit_Time DATE, Customer_ID VARCHAR(10), Location_ID VARCHAR(10), New_Customer TEXT, Sentiment TEXT) """)


cursor.close()
conn.close()



