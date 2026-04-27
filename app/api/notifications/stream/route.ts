import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastSignature = '';

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      req.signal.addEventListener('abort', () => {
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      });

      const poll = async () => {
        if (closed) return;
        try {
          const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              type: true,
              title: true,
              message: true,
              read: true,
              createdAt: true,
              eventId: true,
              bookedByUserId: true,
              bookedByName: true,
              bookedByProfileUrl: true,
            },
          });

          // Only send if something changed (new notification or read-status change)
          const signature = notifications.map(n => `${n.id}:${n.read}`).join('|');
          if (signature !== lastSignature) {
            lastSignature = signature;
            const formatted = notifications.map(n => ({
              ...n,
              time: formatRelativeTime(n.createdAt),
            }));
            if (!closed) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(formatted)}\n\n`));
            }
          }
        } catch {
          // ignore DB errors during stream
        }

        if (!closed) {
          setTimeout(poll, 3000);
        }
      };

      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
