import * as React from 'react';
import { IComputedValue, reaction } from 'mobx';
import { observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import ToolTip from '@material-ui/core/Tooltip';
import Slider from '@material-ui/core/Slider';
import Help from '@material-ui/icons/Help';
import { Markup } from '../k-line/plot/plot';
import { ControlPanelStore } from './control-store';
import styles from './control.css';
import { SubjectMatter } from '../../services/subject-matter/subject-matter';

type ControlPanelProperty = {
  // 入场点
  entryPoint: number;
  // 出场点
  exitPoint: number;
  setEntryPoint(point: number): void;
  setExitPoint(point: number): void;
  onChangeCommitted(): void;
};

const ControlPanel = React.memo(
  ({
    entryPoint,
    exitPoint,
    setEntryPoint,
    setExitPoint,
    onChangeCommitted,
  }: ControlPanelProperty) => {
    const onEntryChange = React.useCallback(
      (_: unknown, value: number | number[]) => {
        if (typeof value !== 'number') {
          throw new Error('Must be number!!');
        }
        setEntryPoint(value);
      },
      [setEntryPoint],
    );

    const onExitChange = React.useCallback(
      (_: unknown, value: number | number[]) => {
        if (typeof value !== 'number') {
          throw new Error('Must be number!!');
        }
        setExitPoint(value);
      },
      [setExitPoint],
    );

    const entryHelpText = `高于${entryPoint}日最大值时入场`;
    const exitHelpText = `低于${exitPoint}日最低值时出场`;
    return (
      <div className={styles.container}>
        <div className={styles.slider}>
          <div className={styles.sliderTitle}>
            <Typography gutterBottom>入场点</Typography>
            <ToolTip title={entryHelpText}>
              <Help fontSize="small" className={styles.helpIcon} />
            </ToolTip>
          </div>
          <Slider
            value={entryPoint}
            step={5}
            onChange={onEntryChange}
            onChangeCommitted={onChangeCommitted}
            min={10}
            max={365}
            valueLabelDisplay="auto"
          />
        </div>
        <div className={styles.slider}>
          <div className={styles.sliderTitle}>
            <Typography gutterBottom>出场点</Typography>
            <ToolTip title={exitHelpText}>
              <Help fontSize="small" className={styles.helpIcon} />
            </ToolTip>
          </div>
          <Slider
            value={exitPoint}
            step={1}
            onChange={onExitChange}
            onChangeCommitted={onChangeCommitted}
            min={7}
            max={30}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  },
);

export function createControlPanel(
  setMarkup: (markups: Markup[]) => void,
  boxedSubjectMatter: IComputedValue<SubjectMatter | undefined>,
) {
  const controlPanelStore = new ControlPanelStore();
  const setEntryPoint = (point: number) =>
    controlPanelStore.setEntryPoint(point);
  const setExitPoint = (point: number) => controlPanelStore.setExitPoint(point);
  const onChangeCommitted = () => {
    const subjectMatter = boxedSubjectMatter.get();
    const markups =
      subjectMatter == null
        ? []
        : controlPanelStore.calculateMarkups(subjectMatter);
    setMarkup(markups);
  };
  reaction(
    () => boxedSubjectMatter.get(),
    (subjectMatter) => subjectMatter && onChangeCommitted(),
    { fireImmediately: true },
  );
  return observer(() => (
    <ControlPanel
      entryPoint={controlPanelStore.entryPoint}
      exitPoint={controlPanelStore.exitPoint}
      setEntryPoint={setEntryPoint}
      setExitPoint={setExitPoint}
      onChangeCommitted={onChangeCommitted}
    />
  ));
}
