'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-7xl font-bold text-white mb-4">Type Type</h1>
        <p className="text-2xl text-slate-300 mb-8">
          A high-speed competitive typing game where every word counts
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">Fast-Paced</h3>
            <p className="text-sm text-slate-400">
              Race against time as the ball bounces back and forth
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-white mb-2">Progressive</h3>
            <p className="text-sm text-slate-400">
              Words get harder and the ball moves faster each volley
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-white mb-2">Competitive</h3>
            <p className="text-sm text-slate-400">
              Play solo or challenge a friend from anywhere
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/game"
            className="px-8 py-4 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors active:scale-95"
          >
            Play Solo
          </Link>
          <Link
            href="/multiplayer"
            className="px-8 py-4 text-xl font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors active:scale-95"
          >
            Play Online
          </Link>
        </div>

        {/* How to Play */}
        <div className="mt-16 text-left bg-slate-800 p-8 rounded-lg border border-slate-700 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <ol className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>
                A ball bounces between two sides of the screen
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>
                Type the displayed word before the ball reaches your wall
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>
                Correct word = ball bounces back. Wrong or too slow = you lose
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span>
                Each volley increases difficulty and ball speed
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
