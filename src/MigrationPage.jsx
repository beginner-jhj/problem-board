import { NavToHome } from "./App";
import MigrationTool from "./components/MigrationTool";

export default function MigrationPage() {
  return (
    <>
      <header className="nav-bar">
        <div className="container w-full flex items-center justify-between">
          <NavToHome />
        </div>
      </header>
      <main className="container py-6 flex items-center justify-center">
        <MigrationTool />
      </main>
    </>
  );
}
