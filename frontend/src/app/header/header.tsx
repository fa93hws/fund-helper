import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import ToolBar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { observer } from 'mobx-react';
import { IComputedValue } from 'mobx';
import { HeaderStore } from './header-store';
import styles from './header.css';

export type FundInfo = {
  id: string;
  name: string;
  typ: string;
};

type HeaderProps = {
  idInput: string;
  info: FundInfo | undefined;
  onIdChange: (id: string) => void;
  onSubmit: () => void;
};

export const Header = React.memo(
  ({ idInput, info, onSubmit, onIdChange }: HeaderProps) => {
    const handleSubmit = React.useCallback(
      (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit();
      },
      [onSubmit],
    );
    const handleIdChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onIdChange(e.target.value);
      },
      [onIdChange],
    );

    return (
      <AppBar position="static" className={styles.bar}>
        <ToolBar>
          <form onSubmit={handleSubmit}>
            <InputBase
              onChange={handleIdChange}
              value={idInput}
              style={{ color: 'white' }}
              margin="dense"
              placeholder="基金ID"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </form>
          <div className={styles.fundInfo}>
            {info && (
              <Typography variant="h6" component="h6">
                {info.name}@{info.id} ({info.typ})
              </Typography>
            )}
          </div>
        </ToolBar>
      </AppBar>
    );
  },
);

export function createHeader(
  fetchValues: (id: string) => Promise<void>,
  basicInfo: IComputedValue<FundInfo | undefined>,
) {
  const store = new HeaderStore(fetchValues);
  const onIdChange = (id: string) => store.setIdInput(id);
  const onSubmit = () => store.onSubmit();
  return observer(() => (
    <Header
      idInput={store.idInput}
      info={basicInfo.get()}
      onSubmit={onSubmit}
      onIdChange={onIdChange}
    />
  ));
}
