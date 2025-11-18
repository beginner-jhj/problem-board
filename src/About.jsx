import { NavToHome, Footer } from "./App";
import { Helmet } from 'react-helmet-async';
import { Link } from "react-router";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About — Problem Board</title>
        <meta name="description" content="About Problem Board: what it is, how it works, and who it's for." />
      </Helmet>

      <header className="nav-bar">
        <div className="container w-full flex items-center justify-between">
          <NavToHome />
          <Link to="/" className="btn">Back</Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="card p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">What is Problem Board?</h1>
          <p className="muted text-sm mb-4">
            Problem Board is a platform where everyday problems meet creative solutions. It helps developers
            overcome "idea block" by providing real-world problems that people actually face. It's a space
            where inspiration starts with someone saying "I wish this existed." 
          </p>

          <h2 className="text-xl font-medium mt-6 mb-2">How it works</h2>
          <p className="text-sm muted mb-2"><strong>For Developers:</strong> Browse real problems people encounter in their daily lives. Watch problems that interest you to signal demand. Build solutions that people actually need, not just ideas you think might work.</p>
          <p className="text-sm muted mb-2"><strong>For Everyone:</strong> Share the small frustrations and inconveniences you face. Your everyday problems could spark the next great app or service. No technical knowledge required—just describe what bugs you.</p>

          <h3 className="text-lg font-medium mt-4 mb-2">Status system</h3>
          <p className="text-sm muted mb-2">Each problem has a <strong>status</strong> that helps indicate its current state and priority. The app uses three statuses:</p>
          <ul className="list-disc pl-5 text-sm muted mb-3">
            <li><strong>Open</strong> — The default state for new problems. Open problems are visible to everyone and can be watched, empathized with, and discussed.</li>
            <li><strong>Trending</strong> — When a problem has a rising number of watchers it becomes Trending. Specifically, the app marks a problem as Trending when its watch count passes a small threshold (more than 3 watchers). Trending signals clear maker interest and can help you prioritize which problems others are also paying attention to.</li>
            <li><strong>Resolved</strong> — When the problem owner accepts a comment/solution, the problem becomes Resolved. Once Resolved it remains Resolved (accepting a solution takes precedence over watch counts), indicating the owner has confirmed a working solution.</li>
          </ul>
          <p className="text-sm muted mb-4">Behavior summary: new problems start as <em>Open</em>; watching/unwatching updates the watch count and will flip a problem to <em>Trending</em> if the count goes above the threshold; when a solution is accepted the problem becomes <em>Resolved</em> and stays resolved regardless of later watch activity.</p>

          <h2 className="text-xl font-medium mt-6 mb-2">Why Problem Board?</h2>
          <p className="text-sm muted mb-2">Beat Idea Block: Stop staring at a blank screen wondering what to build. Start with a specific, real-world trigger that gets you coding.</p>
          <p className="text-sm muted mb-2">Validate Before Building: See how many makers are interested in the same problem. High watch counts mean there's genuine demand.</p>
          <p className="text-sm muted mb-4">Find Hidden Opportunities: A simple complaint often hides a complex need. The best solutions come from reading between the lines of everyday frustrations.</p>

          <h2 className="text-xl font-medium mt-6 mb-2">Who is it for?</h2>
          <ul className="list-disc pl-5 text-sm muted">
            <li>Indie hackers looking for their next side project</li>
            <li>Students needing project ideas for portfolios</li>
            <li>Developers tired of tutorial hell and ready to build something real</li>
            <li>Anyone frustrated by daily inconveniences who wants to see them fixed</li>
            <li>Entrepreneurs searching for problems worth solving at scale</li>
          </ul>

          <div className="mt-6">
            <Link to="/post" className="btn btn-primary">Share a problem</Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
