export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 text-center text-gray-500 text-sm">
      &copy; {new Date().getFullYear()} TaskPulse. All rights reserved.
    </footer>
  );
}