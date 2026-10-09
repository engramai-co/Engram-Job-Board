import { createTheme, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import type { ReactNode } from 'react';
import 'dayjs/locale/zh-cn';
const theme = createTheme({
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  primaryColor: 'forest', primaryShade: 7, defaultRadius: 'md',
  colors: { forest: ['#eef7f2','#daeee2','#b6ddc7','#90caae','#6bb994','#4da77d','#398e67','#287653','#1f6044','#174c36'] },
  headings: { fontFamily: 'inherit', fontWeight: '650' },
  components: {
    Button: { defaultProps: { size: 'sm' } },
    ActionIcon: { defaultProps: { size: 'lg', variant: 'subtle', color: 'gray' } },
    TextInput: { defaultProps: { size: 'sm' } },
    Select: { defaultProps: { size: 'sm', nothingFoundMessage: '没有匹配项', comboboxProps: { withinPortal: true, zIndex: 400 } } },
    Textarea: { defaultProps: { size: 'sm' } },
    Menu: { defaultProps: { position: 'bottom-end', withinPortal: true, shadow: 'md', radius: 'md', zIndex: 450 } },
    Drawer: { defaultProps: { position: 'right', size: 580, padding: 'lg', overlayProps: { backgroundOpacity: 0.24 }, transitionProps: { duration: 180 }, closeButtonProps: { 'aria-label': '关闭编辑窗口' } } },
  },
});
export function UIProvider({ children }: { children: ReactNode }) {
  return <MantineProvider theme={theme} forceColorScheme="light"><DatesProvider settings={{ locale: 'zh-cn', firstDayOfWeek: 1 }}>{children}</DatesProvider></MantineProvider>;
}
