ERP — Integrated Business Management System

A comprehensive full-stack ERP solution built with Django REST Framework (backend) and React.js (frontend) to manage Marketing, Sales, Production, and Transport & Logistics operations — all in one intelligent dashboard.

🧩 Project Overview

The UniBrain ERP System is designed to streamline enterprise workflows across key business departments — from marketing campaigns to sales tracking, production efficiency, and logistics management.

It provides data-driven insights through powerful analytics dashboards and ensures smooth coordination between teams.

💼 Core Modules:

📣 Marketing Management – Track campaigns, clients, and performance analytics.

💰 Sales Management – Manage customers, invoices, and daily sales reports.

🏭 Production Management – Record raw materials, monitor production efficiency, and analyze by-product performance.

🚚 Transport & Logistics – Manage fleet records, trip details, and delivery analytics.

⚙️ Tech Stack
Layer	Technology
Frontend	React.js, Axios, Recharts, React Router
Backend	Django, Django REST Framework (DRF)
Database	PostgreSQL / SQLite (for development)
Version Control	Git + GitHub
Deployment (optional)	Render / Vercel / AWS
🗂️ Folder Structure
unibrain-erp/
├── backend/
│   ├── manage.py
│   ├── core/
│   │   ├── models/
│   │   │   ├── marketing.py
│   │   │   ├── sales.py
│   │   │   ├── production.py
│   │   │   └── transport.py
│   │   ├── serializers/
│   │   ├── views/
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── marketingApi.js
│   │   │   ├── salesApi.js
│   │   │   ├── productionApi.js
│   │   │   └── transportApi.js
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── MarketingAnalytics.jsx
│   │   │   │   ├── SalesAnalytics.jsx
│   │   │   │   ├── ProductionAnalytics.jsx
│   │   │   │   └── TransportAnalytics.jsx
│   │   │   ├── AddForms/
│   │   │   │   ├── AddMarketing.jsx
│   │   │   │   ├── AddSale.jsx
│   │   │   │   ├── AddProduction.jsx
│   │   │   │   └── AddTransport.jsx
│   │   │   └── Lists/
│   │   │       ├── MarketingList.jsx
│   │   │       ├── SalesList.jsx
│   │   │       ├── ProductionList.jsx
│   │   │       └── TransportList.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── README.md
└── LICENSE

⚡ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/petermagaga/unibrain-erp.git
cd unibrain-erp

2️⃣ Backend Setup (Django)
cd backend
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Backend runs on 👉 http://127.0.0.1:8000/

3️⃣ Frontend Setup (React)
cd ../frontend
npm install
npm start


Frontend runs on 👉 http://localhost:3000/

🔗 Connect Frontend with Backend

In each API file (e.g., transportApi.js), update the base URL:

const BASE_URL = "http://127.0.0.1:8000/api/";

📊 Key Features
Module	Description
Marketing	Manage campaigns, leads, and client data with analytics
Sales	Track daily sales, invoices, and customer trends
Production	Record raw material inputs, outputs, and by-product efficiency
Transport	Manage vehicle trips, costs, and performance analytics
Analytics	Generate visual reports by date range, vehicle, shift, and more
Dashboard	Unified view across all business units
Security	Role-based API permissions and authentication-ready
📅 Roadmap
Phase	Description	Status
1. Core Backend	Django REST API for all modules	✅ Completed
2. Frontend Integration	React UI + Axios connections	✅ Completed
3. Analytics Dashboards	Charts for production, sales, transport	✅ Completed
4. Authentication System	JWT or Session-based login	🔄 In Progress
5. Role-Based Access	Admin, Factory Ops, Warehouse	🔜 Next
6. Deployment	Deploy backend + frontend live	🔜 Upcoming
7. Advanced Reports	Export to CSV/PDF + automation	🔜 Planned
🧠 Business Insights

Each analytics page provides:

Efficiency ratios (e.g., Production Output vs Waste)

Sales performance by product or customer

Marketing conversion tracking

Fleet utilization & cost analysis

These metrics enable managers to make data-driven decisions and optimize business performance.

👨‍💻 Author

Peter Magaga
💡 Full Stack Developer — Python | Django | React | Flutter
