export default function Layout() {
  return (
    <section className="flex flex-col min-h-screen w-full bg-background">
      <header className="border-b border-border p-3">Sample Header</header>
      <div className="flex-1 flex">
        <aside className="w-[90%] max-w-56">Aside</aside>
        <main className="flex-1">Main Content</main>
      </div>
    </section>
  );
}
