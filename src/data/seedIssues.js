export const seedIssues = [
  {
    title: 'Broken light in Room 204',
    category: 'Electrical',
    location: 'Academic Block, Room 204',
    priority: 'Medium',
    description: 'The tube light has been flickering and now stays off most of the day.',
    status: 'Reported',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Leaking tap in boys hostel washroom',
    category: 'Plumbing',
    location: 'Boys Hostel, 2nd Floor Washroom',
    priority: 'High',
    description: 'A tap has been leaking continuously for two days, wasting a lot of water.',
    status: 'Assigned',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Wi-Fi not working in library',
    category: 'Internet/Wi-Fi',
    location: 'Central Library',
    priority: 'Medium',
    description: 'Wi-Fi signal drops every few minutes in the reading hall, making it hard to study.',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Broken chair in Seminar Hall',
    category: 'Furniture',
    location: 'Seminar Hall',
    priority: 'Low',
    description: 'One of the chairs near the front row has a broken leg and is unsafe to sit on.',
    status: 'Reported',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]
