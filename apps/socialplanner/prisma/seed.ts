import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  WARNING: seed.ts is running in production mode!');
    console.warn('This script should NOT be run in production.');
    console.warn('Aborting seed process.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash('TestPassword123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
    },
  });

  console.log(`Created/Found user: ${user.email} (ID: ${user.id})`);

  const userId = user.id;

  const platforms = ['X', 'LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as const;
  const statuses = ['IDEA', 'DRAFT', 'SCHEDULED', 'PUBLISHED'] as const;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const previousMonthDate = new Date(currentYear, currentMonth - 1, 15);
  const currentMonthDate1 = new Date(currentYear, currentMonth, 10);
  const currentMonthDate2 = new Date(currentYear, currentMonth, 20);
  const followingMonthDate = new Date(currentYear, currentMonth + 1, 5);
  const followingMonthDate2 = new Date(currentYear, currentMonth + 1, 25);

  const posts: {
    title: string;
    caption: string;
    platform: typeof platforms[number];
    status: typeof statuses[number];
    scheduledAt: Date | null;
  }[] = [
    {
      title: 'New Content Planning Tool',
      caption: 'Just started using a new content planning tool! Excited to see how it improves my workflow.',
      platform: 'X',
      status: 'PUBLISHED',
      scheduledAt: previousMonthDate,
    },
    {
      title: 'Top 5 Engagement Tips',
      caption: 'Here are my top 5 tips for social media engagement in 2024.',
      platform: 'LINKEDIN',
      status: 'PUBLISHED',
      scheduledAt: previousMonthDate,
    },
    {
      title: 'Photoshoot Behind the Scenes',
      caption: 'Behind the scenes of our latest photoshoot. Stay tuned for the final results!',
      platform: 'INSTAGRAM',
      status: 'PUBLISHED',
      scheduledAt: previousMonthDate,
    },
    {
      title: 'We Are Hiring',
      caption: 'We are hiring! Join our growing team of creative professionals.',
      platform: 'FACEBOOK',
      status: 'PUBLISHED',
      scheduledAt: previousMonthDate,
    },
    {
      title: 'Consistency in Marketing',
      caption: 'Quick thread on the importance of consistency in social media marketing.',
      platform: 'X',
      status: 'SCHEDULED',
      scheduledAt: currentMonthDate1,
    },
    {
      title: 'Networking Trends',
      caption: 'Exploring the latest trends in professional networking and how they shape our industry.',
      platform: 'LINKEDIN',
      status: 'SCHEDULED',
      scheduledAt: currentMonthDate1,
    },
    {
      title: 'Product Launch Sneak Peek',
      caption: 'New product launch coming soon! Here is a sneak peek at what we have been working on.',
      platform: 'INSTAGRAM',
      status: 'SCHEDULED',
      scheduledAt: currentMonthDate2,
    },
    {
      title: 'Live Q&A Session',
      caption: 'Join us for a live Q&A session this Friday at 3 PM EST. Bring your questions!',
      platform: 'FACEBOOK',
      status: 'SCHEDULED',
      scheduledAt: currentMonthDate2,
    },
    {
      title: 'Future of Social Media',
      caption: 'The future of social media is here. Check out our latest blog post on emerging platforms.',
      platform: 'X',
      status: 'SCHEDULED',
      scheduledAt: followingMonthDate,
    },
    {
      title: 'AI Content Creation',
      caption: 'Thoughts on AI-powered content creation and what it means for marketers.',
      platform: 'LINKEDIN',
      status: 'SCHEDULED',
      scheduledAt: followingMonthDate,
    },
    {
      title: 'Work-Life Balance',
      caption: 'Weekend vibes! Here is how we balance work and life in the social media world.',
      platform: 'INSTAGRAM',
      status: 'SCHEDULED',
      scheduledAt: followingMonthDate2,
    },
    {
      title: 'Client Success Story',
      caption: 'Customer spotlight: See how our clients are crushing their social media goals.',
      platform: 'FACEBOOK',
      status: 'SCHEDULED',
      scheduledAt: followingMonthDate2,
    },
    {
      title: 'Q1 Performance Analysis',
      caption: 'Draft: Analysis of Q1 social media performance metrics and key takeaways.',
      platform: 'X',
      status: 'DRAFT',
      scheduledAt: null,
    },
    {
      title: 'Social Media Strategy',
      caption: 'Draft: Creating a comprehensive social media strategy for small businesses.',
      platform: 'LINKEDIN',
      status: 'DRAFT',
      scheduledAt: null,
    },
    {
      title: 'Holiday Content Ideas',
      caption: 'Draft: Visual content ideas for the upcoming holiday season.',
      platform: 'INSTAGRAM',
      status: 'DRAFT',
      scheduledAt: null,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: {
        userId,
        title: post.title,
        caption: post.caption,
        platform: post.platform,
        status: post.status,
        scheduledAt: post.scheduledAt,
      },
    });
  }

  console.log(`Created ${posts.length} posts for user ${user.email}`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
