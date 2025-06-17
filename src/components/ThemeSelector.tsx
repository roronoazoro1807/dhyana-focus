import { Palette } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useThemeStore, ThemeType } from '../lib/store';

const themes = [
  { id: 'neon-blue' as ThemeType, name: 'Blue', icon: '🔵' },
  { id: 'neon-pink' as ThemeType, name: 'Pink', icon: '💗' },
  { id: 'neon-green' as ThemeType, name: 'Green', icon: '💚' },
  { id: 'neon-purple' as ThemeType, name: 'Purple', icon: '💜' },
  { id: 'neon-orange' as ThemeType, name: 'Orange', icon: '🧡' },
  { id: 'neon-yellow' as ThemeType, name: 'Yellow', icon: '💛' },
  { id: 'neon-cyan' as ThemeType, name: 'Cyan', icon: '🔷' },
  { id: 'neon-red' as ThemeType, name: 'Red', icon: '❤️' },
  { id: 'neon-teal' as ThemeType, name: 'Teal', icon: '🌊' },
  { id: 'neon-lime' as ThemeType, name: 'Lime', icon: '🍏' },
  { id: 'neon-indigo' as ThemeType, name: 'Indigo', icon: '🟣' },
  { id: 'neon-rose' as ThemeType, name: 'Rose', icon: '🌹' },
  { id: 'zen' as ThemeType, name: 'Zen (Default)', icon: '🍃' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center">
          <Palette size={24} className="mr-1" />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
        <div className="grid grid-cols-2 gap-1">
          {themes.map((t) => (
            <DropdownMenu.Item
              key={t.id}
              className={`flex items-center px-3 py-2 rounded cursor-pointer ${
                theme === t.id ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setTheme(t.id)}
            >
              <span className="mr-2">{t.icon}</span>
              {t.name}
            </DropdownMenu.Item>
          ))}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}