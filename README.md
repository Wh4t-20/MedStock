# 🏥 MedLab System

A **Medical Laboratory Management System** built with **Vue 3 + TypeScript + Tailwind CSS**.

## Features

- **Doctor Portal** — Create lab requests, manage patients & doctors, browse test types
- **Patient Portal** — View personal lab requests & test results
- **Technician Portal** — Process the test queue, enter results, manage technicians
- Blue & Yellow color scheme throughout

## Normalized Data Model (3NF)

```
Patient      (patient_id PK, first_name, middle_name, last_name, dob, sex, email, contact_number, address, height, weight)
Doctor       (doctor_id PK, first_name, last_name, email, contact_number, specialization)
LabTechnician(technician_id PK, first_name, last_name, email, contact_number, license_number)
TestType     (test_type_id PK, test_name, category, description, normal_range)
LabRequest   (request_id PK, patient_id FK, doctor_id FK, request_date, status, notes)
RequestDetail(detail_id PK, request_id FK, test_type_id FK)          ← resolves LabRequest ↔ TestType M:N
TestResult   (result_id PK, detail_id FK, technician_id FK, result_value, result_date, remarks)
```

## Project Structure

```
src/
├── api/         db.ts          — Seed data & in-memory store
├── components/  Modal, NavItem, StatCard, StatusBadge
├── router/      index.ts
├── stores/      lab.ts         — Pinia store (full CRUD)
├── types/       index.ts       — All TypeScript interfaces
└── views/
    ├── Landing.vue
    ├── doctor/     DoctorLayout, Dashboard, Requests, Patients, Directory, TestTypes
    ├── patient/    PatientLayout, Dashboard, Requests, Directory
    └── technician/ TechnicianLayout, Dashboard, Queue, Results, Directory
```

## Getting Started

```bash
npm install
npm run dev        # development server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Replacing the In-Memory DB

All data lives in `src/api/db.ts` and `src/stores/lab.ts`.
Replace the store actions with `fetch()` calls to your backend API.

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Framework | Vue 3 (Composition API) |
| Language  | TypeScript              |
| Styling   | Tailwind CSS v3         |
| State     | Pinia                   |
| Routing   | Vue Router 4            |
| Build     | Vite 5                  |
