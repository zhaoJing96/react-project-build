// 引入 ECharts 主模块
import * as echarts from 'echarts/lib/echarts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
echarts.use([GridComponent, LegendComponent, TitleComponent, TooltipComponent, DataZoomComponent]);
export default echarts;
