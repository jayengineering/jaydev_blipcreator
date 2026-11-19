import { ColorSwatch, Grid, Group, Input, isLightColor, NumberInput, Slider, Stack, Switch, Text, TextInput, Tooltip } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import type { BlipColor, BlipDraft, SpriteCategory } from '../types';
import { blipColor } from '../colors';
import { SpritePicker } from './SpritePicker';

interface BlipFormProps {
  value: BlipDraft;
  onChange: (value: BlipDraft) => void;
  colors: BlipColor[];
  categories: SpriteCategory[];
}

export function BlipForm({ value, onChange, colors, categories }: BlipFormProps) {
  const set = <K extends keyof BlipDraft>(key: K, next: BlipDraft[K]) => onChange({ ...value, [key]: next });

  return (
    <Grid gap={40}>
      <Grid.Col span={5}>
        <Stack gap={24}>
          <TextInput
            label="Name"
            placeholder="Enter blip name"
            value={value.name}
            onChange={(e) => set('name', e.currentTarget.value)}
          />

          <Group justify="space-between" wrap="nowrap" className="setting-row">
            <div>
              <Text size="sm" fw={600}>
                Nearby Only
              </Text>
              <Text size="xs" c="dimmed">
                {value.shortRange ? 'Hidden until a player is close by' : 'Always shown on the map'}
              </Text>
            </div>
            <Switch
              size="md"
              checked={value.shortRange}
              onChange={(e) => set('shortRange', e.currentTarget.checked)}
              aria-label="Nearby Only"
            />
          </Group>

          <Input.Wrapper
            label={
              <Group justify="space-between">
                <span>Scale</span>
                <Text span size="sm" c="dimmed" fw={500}>
                  {value.scale.toFixed(1)}
                </Text>
              </Group>
            }
          >
            <Slider
              mt={10}
              min={0.1}
              max={2}
              step={0.1}
              label={null}
              value={value.scale}
              onChange={(scale) => set('scale', Math.round(scale * 10) / 10)}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Colour">
            <Group gap={8}>
              {colors.map((color) => (
                <Tooltip key={color.id} label={color.name}>
                  <ColorSwatch
                    component="button"
                    type="button"
                    color={blipColor(color.id)}
                    size={28}
                    radius="xs"
                    withShadow={false}
                    onClick={() => set('color', color.id)}
                    style={{ cursor: 'pointer', color: isLightColor(blipColor(color.id)) ? '#000' : '#fff' }}
                    aria-label={color.name}
                  >
                    {value.color === color.id && <IconCheck size={16} stroke={3} />}
                  </ColorSwatch>
                </Tooltip>
              ))}
            </Group>
          </Input.Wrapper>

          <Group gap="md" grow>
            <NumberInput
              label="Colour ID"
              placeholder="0–85"
              value={value.color}
              min={0}
              max={85}
              clampBehavior="strict"
              allowDecimal={false}
              onChange={(color) => typeof color === 'number' && set('color', color)}
            />
            <NumberInput
              label="Sprite ID"
              placeholder="0–826"
              value={value.sprite}
              min={0}
              max={826}
              clampBehavior="strict"
              allowDecimal={false}
              onChange={(sprite) => typeof sprite === 'number' && set('sprite', sprite)}
            />
          </Group>
        </Stack>
      </Grid.Col>

      <Grid.Col span={7}>
        <Input.Wrapper label="Sprite">
          <SpritePicker categories={categories} value={value.sprite} onChange={(sprite) => set('sprite', sprite)} />
        </Input.Wrapper>
      </Grid.Col>
    </Grid>
  );
}
