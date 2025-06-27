# Task Manager

A simple and clean task management app built with React, Node.js, and PostgreSQL. Perfect for teams who want to get things done without the complexity.

## What it does

This is a kanban-style task manager where you can:
- Create projects and invite team members
- Add tasks and move them through To Do → In Progress → Done
- Assign tasks to people and set due dates
- Comment on tasks and have conversations
- Filter and search to find what you need


## The technologies used are:

**Frontend:** React with Tailwind CSS for a clean, responsive design
**Backend:** Node.js with Express and Prisma (makes database stuff easy)
**Database:** PostgreSQL 
**Authentication:** JWT tokens (secure but straightforward)

## Getting it running

You'll need Node.js and PostgreSQL installed.

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd task-manager
   
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd ../frontend && npm install
   ```

2. **Set up your database**
   Create a `.env` file in the backend folder:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/task_manager"
   JWT_SECRET="make-this-something-random"
   PORT=5000
   ```

3. **Initialize the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. **Start everything**
   ```bash
   # Backend (in one terminal)
   cd backend && npm run dev
   
   # Frontend (in another terminal)
   cd frontend && npm run dev
   ```

Visit `http://localhost:5173` and you're good to go!

## How it works

The app has three main parts:
- **Projects** - Container for related tasks
- **Tasks** - The actual work items with details, assignments, and due dates
- **Comments** - Team discussions on specific tasks

You can drag tasks between columns, assign them to teammates, set priorities, and keep track of everything in one place.

## What's nice about it

- **Clean interface** - No clutter, just what you need
- **Real-time updates** - Changes appear instantly for everyone
- **Team collaboration** - Comments, assignments, and project sharing
- **Works everywhere** - Responsive design for desktop and mobile
- **Actually fast** - Built with modern tools for speed

## Current limitations

- No file uploads yet
- Email notifications aren't built in
- Limited to 5 levels of comment replies
- No time tracking features

## Future ideas

Things I'd like to add someday:
- File attachments on tasks
- Email notifications for assignments
- Calendar view for due dates
- Time tracking
- Mobile app
- Better reporting and analytics

## Contributing

Found a bug or want to add something? Feel free to open an issue or submit a pull request. I'm open to ideas!

## Notes

This started as a learning project to understand full-stack development with modern tools. It's grown into something actually useful, so I figured I'd share it.

The code is pretty straightforward - if you're learning React or Node.js, this might be a good project to study or build upon.

---

Built with ☕ and way too many Stack Overflow searches.
