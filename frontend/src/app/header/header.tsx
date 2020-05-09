import { observer } from 'mobx-react';
import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Alert from '@material-ui/lab/Alert';
import InputBase from '@material-ui/core/InputBase';
import ToolBar from '@material-ui/core/Toolbar';
import Snackbar from '@material-ui/core/Snackbar';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import { FundInfo, HeaderStore } from './header-store';
import styles from './header.css';
import { CanFetchFundValue } from '../../services/fund-value-service';

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

export function createHeader(fundValueService: CanFetchFundValue) {
  const store = new HeaderStore(fundValueService);
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
