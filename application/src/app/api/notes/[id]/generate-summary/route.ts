import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DigitalOceanInferenceService } from '@/services/digitalOceanInferenceService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const noteId = params.id;

    // Get the note and verify ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { user: true },
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    if (note.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate summary using AI
    const aiService = new DigitalOceanInferenceService();
    const summary = await aiService.generateSummary(note.content);

    // Update note with generated summary
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { summary },
    });

    return NextResponse.json({
      success: true,
      summary: updatedNote.summary,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const noteId = params.id;

    // Get the note and verify ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { user: true },
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    if (note.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Clear summary by setting it to null
    await prisma.note.update({
      where: { id: noteId },
      data: { summary: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Summary cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing summary:', error);
    return NextResponse.json(
      { error: 'Failed to clear summary' },
      { status: 500 }
    );
  }
}