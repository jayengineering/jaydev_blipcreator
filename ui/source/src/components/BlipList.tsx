import { useMemo, useState } from 'react';
import { ActionIcon, Box, Center, Group, Stack, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { IconMapPinFilled, IconPencil, IconSearch, IconTrash } from '@tabler/icons-react';
import type { Blip } from '../types';
import { SpriteIcon } from './SpriteIcon';
import classes from './BlipList.module.css';

interface BlipListProps {
  blips: Blip[];
  onEdit: (blip: Blip) => void;
  onDelete: (blip: Blip) => void;
}

export function BlipList({ blips, onEdit, onDelete }: BlipListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return blips;
    return blips.filter(
      (blip) =>
        blip.name.toLowerCase().includes(search) || String(blip.sprite).includes(search) || String(blip.color).includes(search),
    );
  }, [blips, query]);

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search by name, sprite or colour ID"
        leftSection={<IconSearch size={16} stroke={2} />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
      />

      {filtered.length === 0 ? (
        <Stack align="center" gap={6} py={56}>
          <Center className={classes.emptyIcon}>
            {blips.length === 0 ? <IconMapPinFilled size={24} /> : <IconSearch size={22} stroke={2.5} />}
          </Center>
          <Text fz={15} fw={600} mt={10}>
            {blips.length === 0 ? 'No Blips Yet' : 'No Matches'}
          </Text>
          <Text fz={13} c="dimmed">
            {blips.length === 0 ? 'Blips you create show up here.' : 'Try a different search.'}
          </Text>
        </Stack>
      ) : (
        <Stack gap={6}>
          {filtered.map((blip) => (
            <Group key={blip.id} className={classes.row} wrap="nowrap" gap="sm">
              <UnstyledButton className={classes.main} onClick={() => onEdit(blip)}>
                <Group wrap="nowrap" gap="md">
                  <Center w={44} h={44}>
                    <SpriteIcon sprite={blip.sprite} />
                  </Center>
                  <Box miw={0}>
                    <Text fz={15} fw={600} lh={1.3} truncate>
                      {blip.name}
                    </Text>
                    <Group gap={16} mt={4} wrap="nowrap">
                      <Meta label="Sprite" value={blip.sprite} />
                      <Meta label="Colour" value={blip.color} />
                      <Meta label="Scale" value={blip.scale.toFixed(1)} />
                      <Text fz={13} c="dimmed">
                        {blip.shortRange ? 'Nearby Only' : 'Always Visible'}
                      </Text>
                    </Group>
                  </Box>
                </Group>
              </UnstyledButton>

              <Group gap={8} wrap="nowrap">
                <Tooltip label="Edit">
                  <ActionIcon className="silver-button" size="lg" onClick={() => onEdit(blip)} aria-label="Edit">
                    <IconPencil size={18} stroke={2.5} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon className="silver-button" size="lg" onClick={() => onDelete(blip)} aria-label="Delete">
                    <IconTrash size={18} stroke={2.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function Meta({ label, value }: { label: string; value: string | number }) {
  return (
    <Text fz={13} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
      {label}{' '}
      <Text span inherit c="gray.3" fw={600}>
        {value}
      </Text>
    </Text>
  );
}
