# LectureLens

## Setup Instructions

1. Clone the repository
	```bash
	git clone https://github.com/yourusername/lecturelens.git
	cd lecturelens
	```

2. Create and activate virtual environment
	```bash
	python3 -m venv venv
	source venv/bin/activate   # macOS/Linux
	# venv\Scripts\activate    # Windows
	```

3. Install dependencies
	```bash
	pip install -r requirements.txt
	```

4. Setup PostgreSQL
	Install PostgreSQL (macOS example):
	```bash
	brew install postgresql
	brew services start postgresql
	```

	Create database and user:
	```sql
	-- Open psql shell
	psql postgres

	-- Create user
	CREATE USER lecturelens_user WITH PASSWORD 'strongpassword';

	-- Create database
	CREATE DATABASE lecturelens;

	-- Grant privileges
	GRANT ALL PRIVILEGES ON DATABASE lecturelens TO lecturelens_user;

	-- Optional settings
	ALTER ROLE lecturelens_user SET client_encoding TO 'utf8';
	\q
	```

5. Configure Django database
	Edit [config/settings.py](config/settings.py):
	```python
	DATABASES = {
		 'default': {
			  'ENGINE': 'django.db.backends.postgresql',
			  'NAME': 'lecturelens',
			  'USER': 'lecturelens_user',
			  'PASSWORD': 'strongpassword',
			  'HOST': 'localhost',
			  'PORT': '5432',
		 }
	}
	```

6. Apply migrations
	```bash
	python manage.py migrate
	```

7. Create superuser
	```bash
	python manage.py createsuperuser
	```

8. Visit admin in browser
	```
	http://127.0.0.1:8000/admin
	```