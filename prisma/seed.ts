import { db } from '../src/utils/db.server';
import { v4 as uuidv4 } from 'uuid';

type User = {
  username: string;
  email: string;
  hashedPassword: string;
};

type Video = {
  title: string;
  description: string;
  credits?: string;
  isPrivate: boolean;
};

async function seed() {
  await db.video.deleteMany({});
  await db.user.deleteMany({});

  const users = getSeedUsers();
  for (const user of users) {
    await db.user.create({
      data: {
        id: uuidv4(),
        username: user.username,
        email: user.email,
        hashedPassword: user.hashedPassword,
      },
    });
  }

  const user = await db.user.findFirst();

  if (user) {
    const videos = getSeedVideos();
    for (const video of videos) {
      await db.video.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          title: video.title,
          description: video.description,
          credits: video.credits,
          isPrivate: video.isPrivate,
        },
      });
    }
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

function getSeedUsers(): Array<User> {
  return [
    {
      username: 'johndoe',
      email: 'john.doe@example.com',
      hashedPassword: 'hashedpassword1',
    },
    {
      username: 'janedoe',
      email: 'jane.doe@example.com',
      hashedPassword: 'hashedpassword2',
    },
    {
      username: 'alice',
      email: 'alice@example.com',
      hashedPassword: 'hashedpassword3',
    },
  ];
}

function getSeedVideos(): Array<Video> {
  return [
    {
      title: 'Exploring the Universe',
      description: 'A deep dive into the cosmos and the beauty it holds.',
      credits: 'Directed by John Doe, Narrated by Jane Smith',
      isPrivate: false,
    },
    {
      title: 'Cooking 101: Basics of the Kitchen',
      description:
        'Learn the fundamentals of cooking with this beginner-friendly guide.',
      isPrivate: true,
    },
    {
      title: 'The Art of Coding',
      description:
        'Understanding the elegance and artistry behind programming.',
      credits: 'Hosted by Alice Johnson',
      isPrivate: false,
    },
  ];
}
