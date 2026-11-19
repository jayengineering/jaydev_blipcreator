import { useEffect, useMemo, useState } from 'react';
import { Group, Pagination, SimpleGrid, Stack, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { SpriteCategory } from '../types';
import { SpriteIcon } from './SpriteIcon';
import classes from './SpritePicker.module.css';

const PER_PAGE = 24;
const ALL = 'all';

interface SpritePickerProps {
  categories: SpriteCategory[];
  value: number;
  onChange: (sprite: number) => void;
}

export function SpritePicker({ categories, value, onChange }: SpritePickerProps) {
  const [category, setCategory] = useState(() => {
    const index = categories.findIndex((group) => group.sprites.some((sprite) => sprite.id === value));
    return index === -1 ? ALL : String(index);
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const pool = useMemo(() => {
    if (category !== ALL) return categories[Number(category)]?.sprites ?? [];

    const seen = new Set<number>();
    return categories
      .flatMap((group) => group.sprites)
      .filter((sprite) => {
        if (seen.has(sprite.id)) return false;
        seen.add(sprite.id);
        return true;
      });
  }, [categories, category]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pool;
    return pool.filter((sprite) => sprite.name.toLowerCase().includes(query) || String(sprite.id).includes(query));
  }, [pool, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => setPage(1), [category, search]);

  const categoryOptions = [
    ...categories.map((group, index) => ({ value: String(index), label: group.name })),
    { value: ALL, label: 'All Sprites' },
  ];

  return (
    <Stack gap="sm">
      <Group gap={6}>
        {categoryOptions.map((option) => (
          <UnstyledButton
            key={option.value}
            className={classes.category}
            data-active={category === option.value || undefined}
            onClick={() => setCategory(option.value)}
          >
            {option.label}
          </UnstyledButton>
        ))}
      </Group>

      <TextInput
        placeholder="Search sprites"
        leftSection={<IconSearch size={16} stroke={2} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      {visible.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No sprites found.
        </Text>
      ) : (
        <SimpleGrid cols={6} spacing={6} verticalSpacing={6}>
          {visible.map((sprite) => (
            <Tooltip key={sprite.id} label={`${sprite.name} (${sprite.id})`}>
              <UnstyledButton
                className={classes.tile}
                data-active={sprite.id === value || undefined}
                onClick={() => onChange(sprite.id)}
              >
                <SpriteIcon sprite={sprite.id} />
                <Text size="xs" truncate w="100%" ta="center">
                  {sprite.name}
                </Text>
              </UnstyledButton>
            </Tooltip>
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <Group justify="flex-end">
          <Pagination size="sm" total={totalPages} value={page} onChange={setPage} withEdges={false} />
        </Group>
      )}
    </Stack>
  );
}
