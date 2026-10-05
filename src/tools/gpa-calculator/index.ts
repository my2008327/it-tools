import { Calculator } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.gpa-calculator.title'),
  path: '/gpa-calculator',
  description: translate('tools.gpa-calculator.description'),
  keywords: ['gpa', 'calculator', 'grade', 'point', 'average', 'score', '学分', '绩点'],
  component: () => import('./gpa-calculator.vue'),
  icon: Calculator,
  createdAt: new Date('2026-10-05'),
});
