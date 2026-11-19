import { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Box, Button, CloseButton, Group, Modal, Paper, ScrollArea, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconCurrentLocation, IconPlus, IconX } from '@tabler/icons-react';
import type { Blip, BlipColor, BlipDraft, NuiMessage, SpriteCategory } from './types';
import { fetchNui } from './nui';
import { BlipList } from './components/BlipList';
import { BlipForm } from './components/BlipForm';

type View = 'list' | 'create' | 'edit';

const baseDefaults: BlipDraft = { name: 'New Blip', sprite: 1, color: 0, scale: 0.8, shortRange: true };

export function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('list');
  const [blips, setBlips] = useState<Blip[]>([]);
  const [colors, setColors] = useState<BlipColor[]>([]);
  const [categories, setCategories] = useState<SpriteCategory[]>([]);
  const [defaults, setDefaults] = useState(baseDefaults);
  const [draft, setDraft] = useState(baseDefaults);
  const [editing, setEditing] = useState<BlipDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Blip | null>(null);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => {
    fetchNui('closeMenu').catch(() => {});
  }, []);

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent<NuiMessage>) => {
      switch (data?.action) {
        case 'openMenu': {
          const nextDefaults = { ...baseDefaults, ...data.defaults };
          setBlips(data.blips ?? []);
          setColors(data.commonColors ?? []);
          setCategories(data.spriteCategories ?? []);
          setDefaults(nextDefaults);
          setDraft(nextDefaults);
          setEditing(null);
          setView('list');
          setOpen(true);
          break;
        }
        case 'updateBlips':
          setBlips(data.blips ?? []);
          break;
        case 'closeMenu':
          setOpen(false);
          setPendingDelete(null);
          break;
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open && !pendingDelete) close();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, pendingDelete, close]);

  const startEdit = useCallback((blip: Blip) => {
    setEditing(blip);
    setView('edit');
  }, []);

  const send = async (event: string, data: unknown) => {
    setBusy(true);
    const result = await fetchNui(event, data).catch(() => null);
    setBusy(false);
    return result?.success === true;
  };

  const editNearest = async () => {
    const result = await fetchNui<{ success: boolean; blip?: Blip }>('getNearestBlip').catch(() => null);
    if (result?.blip) startEdit(result.blip);
  };

  const create = async () => {
    if (!(await send('createBlip', { ...draft, name: draft.name.trim() || defaults.name }))) return;
    setDraft(defaults);
    setView('list');
  };

  const save = async () => {
    if (!editing) return;
    if (!(await send('updateBlip', { ...editing, name: editing.name.trim() || defaults.name }))) return;
    setEditing(null);
    setView('list');
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await send('deleteBlip', { id: pendingDelete.id });
    setPendingDelete(null);
  };

  if (!open) return null;

  return (
    <Box h="100vh" style={{ display: 'grid', placeItems: 'center' }}>
      <Paper
        w={1040}
        h={720}
        maw="calc(100vw - 32px)"
        mah="calc(100vh - 32px)"
        radius="xl"
        className="panel"
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Group justify="space-between" px={24} pt={20} pb={16} wrap="nowrap">
          {view === 'list' ? (
            <Box>
              <Title order={4} lh={1.3}>
                Blip Creator
              </Title>
              <Text size="sm" c="dimmed">
                {blips.length} {blips.length === 1 ? 'blip' : 'blips'} on the map
              </Text>
            </Box>
          ) : (
            <Group gap="sm" wrap="nowrap" miw={0}>
              <Tooltip label="Back to List">
                <ActionIcon className="silver-button" size="lg" onClick={() => setView('list')} aria-label="Back">
                  <IconArrowLeft size={18} stroke={2.5} />
                </ActionIcon>
              </Tooltip>
              <Box miw={0}>
                <Title order={4} lh={1.3}>
                  {view === 'edit' ? 'Edit Blip' : 'New Blip'}
                </Title>
                <Text size="sm" c="dimmed" truncate>
                  {view === 'edit' ? editing?.name : 'Placed at your current position'}
                </Text>
              </Box>
            </Group>
          )}

          <Group gap="sm" wrap="nowrap">
            {view === 'list' && (
              <Button className="silver-button" leftSection={<IconPlus size={18} stroke={2.5} />} onClick={() => setView('create')}>
                New Blip
              </Button>
            )}
            <Button className="silver-button" leftSection={<IconCurrentLocation size={18} stroke={2.5} />} onClick={editNearest}>
              Edit Nearest
            </Button>
            <CloseButton className="silver-button" size="lg" icon={<IconX size={18} stroke={2.5} />} onClick={close} aria-label="Close" />
          </Group>
        </Group>

        <ScrollArea flex={1} px={24} type="hover" scrollbarSize={8} offsetScrollbars>
          <Box pb={24} key={view} className="view">
            {view === 'list' && <BlipList blips={blips} onEdit={startEdit} onDelete={setPendingDelete} />}
            {view === 'create' && <BlipForm value={draft} onChange={setDraft} colors={colors} categories={categories} />}
            {view === 'edit' && editing && (
              <BlipForm key={editing.id} value={editing} onChange={setEditing} colors={colors} categories={categories} />
            )}
          </Box>
        </ScrollArea>

        {view !== 'list' && (
          <Group justify="flex-end" gap="sm" px={24} pt={12} pb={20}>
            {view === 'create' ? (
              <>
                <Button className="silver-button" onClick={() => setDraft(defaults)}>
                  Reset
                </Button>
                <Button className="silver-button" onClick={create} loading={busy}>
                  Create Blip
                </Button>
              </>
            ) : (
              <>
                <Button className="silver-button" onClick={() => setView('list')}>
                  Cancel
                </Button>
                <Button className="silver-button" onClick={save} loading={busy}>
                  Save Changes
                </Button>
              </>
            )}
          </Group>
        )}
      </Paper>

      <Modal opened={pendingDelete !== null} onClose={() => setPendingDelete(null)} title="Delete Blip" size="sm">
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            <Text span inherit c="white" fw={600}>
              {pendingDelete?.name}
            </Text>{' '}
            will be removed from the map. This can't be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button className="silver-button" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button className="silver-button" onClick={confirmDelete} loading={busy}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
