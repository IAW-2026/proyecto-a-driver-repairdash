# AGENTS.md

## Project Overview

RepairDash is a service management platform inspired by Uber-style architectures for technical services such as plumbing, electricity, gas repair, and home maintenance.

This repository contains ONLY the Driver App / Worker App.

The system is being developed independently during an academic project stage, meaning:
- external services are NOT available yet
- integrations must be mocked or simulated
- focus is on clean architecture and future scalability

---

# Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Clerk Authentication
- Prisma ORM
- PostgreSQL
- React Server Components
- Server Actions

---

# Design System

## Color Palette

Primary Background:
- #271033 (Midnight Violet)

Primary Accent:
- #F500F1 (Magenta)

Secondary Accent:
- #C392DD (Wisteria)

Text / Highlight:
- #FBDAF9 (Lavender Veil)

## Typography

- Font Family: Montserrat

---

# Application Scope

This app ONLY manages worker/driver functionality.

The following systems are external services and MUST be mocked:
- Rider App
- Payments App
- Feedback App
- Promotions App

Do NOT implement those systems internally.

---

# Core Business Logic

Drivers can:
- go ONLINE / OFFLINE
- receive service jobs
- accept/reject jobs
- update service status
- complete jobs
- visualize earnings
- manage active jobs

Job lifecycle states:

- PENDIENTE
- ACEPTADO
- RECHAZADO
- EN_CAMINO
- EN_SERVICIO
- FINALIZADO
- CANCELADO

---

# Database Rules

Use Prisma ORM.

The current domain models are:

- Driver
- Trabajo
- HistorialEstado

Important:
- riderId is an EXTERNAL reference
- it is NOT a Prisma relation
- Rider data belongs to Rider App

Never create fake internal Rider tables unless explicitly requested.

---

# Prisma Conventions

Always:
- use Prisma Client singleton in lib/prisma.ts
- use Decimal for money
- use enums for statuses
- use timestamps:
  - creadoEn
  - actualizadoEn

Avoid:
- duplicated business logic
- direct SQL queries unless necessary
- unnecessary migrations

---

# Folder Structure

Preferred structure:

app/
components/
lib/
services/
repositories/
actions/
hooks/
types/
prisma/

---

# Architecture Guidelines

## Business Logic

Business rules should NOT live directly inside UI components.

Prefer:
- services/
- server actions
- repositories

---

## API Simulation

Since external services do not exist yet:
- create mock services
- use fake endpoints
- simulate API responses
- isolate mocks from business logic

Preferred approaches:
- mock service layer
- local JSON fixtures
- MSW if needed

---

# UI/UX Guidelines

The UI should feel:
- modern
- minimal
- dark-themed
- dashboard-oriented

Avoid:
- overly colorful interfaces
- heavy animations
- excessive gradients

Preferred style:
- clean cards
- soft borders
- rounded-2xl
- magenta highlights
- subtle shadows

---

# Authentication

Authentication is managed with Clerk.

Rules:
- unauthenticated users -> /login
- authenticated users -> /

Do NOT create custom auth systems.

---

# Coding Standards

## TypeScript

- Avoid any
- Prefer explicit typing
- Use DTOs where useful

---

## React

Prefer:
- Server Components by default
- Client Components only when necessary

Avoid:
- unnecessary useEffect
- prop drilling

---

## Styling

Use TailwindCSS only.

Avoid:
- inline styles
- CSS modules unless necessary

---

# Error Handling

Always:
- validate inputs
- handle async failures
- return meaningful errors

Prefer:
- Zod validation
- typed responses

---

# Performance Guidelines

Prefer:
- server-side fetching
- pagination
- selective Prisma queries

Avoid:
- overfetching
- loading unnecessary relations

---

# Important Development Notes

This project prioritizes:
1. architecture
2. maintainability
3. scalability
4. clean code

Over:
- pixel-perfect design
- advanced animations
- micro-optimizations

---

# Agent Instructions

When generating code:
- keep files modular
- avoid massive components
- explain architectural decisions briefly
- follow Next.js App Router best practices
- prioritize readability

When modifying database logic:
- preserve existing enums and relations
- avoid destructive migrations unless requested

When implementing features:
- think in terms of real-world service marketplace workflows

---

# Current Goal

Build a robust Driver App foundation capable of future integration with:
- Rider App
- Payments App
- Feedback App

while remaining fully functional independently.

---

# System Architecture Constraints

RepairDash follows a distributed application architecture.

Each app:
- has its OWN PostgreSQL database
- owns its OWN data
- is independently deployable

This repository represents ONLY ONE application of the ecosystem.

Important architectural rules:

- Never create cross-database Prisma relations
- Never assume shared database tables between apps
- External entities must be represented only by IDs
- Communication between apps should happen through APIs or mocked services

Example:
- riderId is ONLY an external identifier
- Rider data belongs exclusively to Rider App
- Payments belong exclusively to Payments App

---

# Shared Authentication

Authentication is centralized using Clerk.

All apps:
- share the same Clerk instance
- share user authentication
- do NOT implement local auth systems

The application should rely entirely on Clerk session state.

---

# Payments Rules

Only the Payments App interacts with Mercado Pago.

This app MUST NOT:
- process payments
- store payment methods
- integrate Mercado Pago SDK directly

At most, this app may:
- request payment status
- display mocked payment information

---

# Deployment Assumptions

Target deployment architecture:

Frontend:
- Vercel

Database:
- PostgreSQL
- Neon / Railway / Supabase / Vercel Postgres

Each application is deployed independently.

---

# Styling Guidelines

Primary styling system:
- TailwindCSS

Avoid:
- Chakra UI
- Bootstrap
unless explicitly requested.

---

# ORM Rules

Primary ORM:
- Prisma

Avoid:
- raw SQL unless necessary
- mixing multiple ORMs
- introducing Knex or pg directly
unless explicitly requested.

---

# Responsive Design Philosophy

RepairDash must be designed using a mobile-first approach.

Primary target:
- mobile devices
- drivers using phones during active jobs
- quick interactions while moving

The mobile experience has absolute priority over desktop.

However:
- the application should ALSO provide a polished notebook/desktop dashboard experience
- desktop layouts should feel modern and premium, not stretched mobile screens

---

# Mobile-First UI Rules

When designing interfaces:

- start from mobile layouts first
- prioritize vertical information flow
- optimize thumb reach and touch interactions
- avoid overcrowded screens
- use large tap targets
- prioritize readability during movement

Preferred mobile patterns:
- bottom navigation
- stacked cards
- floating action buttons
- collapsible sections
- compact headers

Avoid:
- large desktop tables on mobile
- tiny buttons
- dense forms
- excessive modals

---

# Desktop / Notebook Experience

Desktop layouts should:
- feel like a modern operations dashboard
- use responsive grids
- include side navigation when appropriate
- take advantage of horizontal space elegantly
- preserve the dark premium aesthetic

Preferred desktop patterns:
- sidebar navigation
- analytics cards
- split layouts
- activity panels
- responsive work tables
- dashboard widgets

Avoid:
- giant empty spaces
- oversized text
- simply centering mobile layouts on desktop

---

# Responsive Development Rules

Always:
- use Tailwind responsive utilities
- think mobile-first
- progressively enhance for larger screens

Preferred breakpoints:
- mobile first
- md for tablet
- lg/xl for notebook and desktop

Components should:
- adapt naturally between mobile and desktop
- preserve usability across all sizes
- avoid duplicated UI implementations when possible

---

# UI Feeling

The UI should feel:

Mobile:
- fast
- practical
- clean
- touch-oriented

Desktop:
- professional
- premium
- operational
- dashboard-oriented

The aesthetic should resemble:
- modern mobility apps
- delivery dashboards
- dark fintech/admin panels
- Uber Driver style interfaces