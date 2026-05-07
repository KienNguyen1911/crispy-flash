import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blank Page | Lingofy',
  description: 'Blank page for testing and development.',
};

export default function BlankPage() {
    return (
        <>
            <div className="container mx-auto max-w-6xl py-8 px-4">
                <div className="text-sm md:text-base">Hello</div>
                <div className="text-sm">Hello sm</div>
                <div className="text-base">Hello base</div>
            </div>
        </>
    );
}
