import { useEffect, useState } from 'react';

export default function FooterPage() {
  const [year, setYear] = useState('');

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="w-full max-w-6xl text-center py-6 shadow-lg mt-10">
      <p className="text-sm text-gray-400">
        &copy; {year} VYSMarket. All rights reserved. Powered by NuEwa Tech
      </p>
    </footer>
  );
}
