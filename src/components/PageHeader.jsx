export default function PageHeader({ title }) {
  return (
    <h1 className="text-2xl md:text-3xl font-bold mb-6">
      {title}
    </h1>
  );
}