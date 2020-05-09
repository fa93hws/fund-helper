import * as React from 'react';
import Alert from '@material-ui/lab/Alert';
import AppBar from '@material-ui/core/AppBar';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Snackbar from '@material-ui/core/Snackbar';
import ToolBar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { observer } from 'mobx-react';
import { HeaderStore, FundInfo } from './header-store';
import styles from './header.css';

type HeaderProps = {
  idInput: string;
  info: FundInfo | undefined;
  onIdChange: (id: string) => void;
  onSubmit: () => void;
  errorMessage: string | undefined;
};

export const Header = React.memo(
  ({ idInput, info, onSubmit, onIdChange, errorMessage }: HeaderProps) => {
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
        <Snackbar open={errorMessage != null}>
          <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
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
                {info.name}@{info.id} ({info.type})
              </Typography>
            )}
          </div>
        </ToolBar>
      </AppBar>
    );
  },
);

export function createHeader(store: HeaderStore) {
  const onSubmit = () => {
    store.fetchValue();
  };
  const onIdChange = (id: string) => store.setIdInput(id);
  return observer(() => (
    <Header
      idInput={store.idInput}
      info={store.info}
      onSubmit={onSubmit}
      onIdChange={onIdChange}
      errorMessage={store.errorMessage}
    />
  ));
}
