import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Header from './Header';

export default function Layout(props) {
    const theme = useTheme();
    const background = theme.palette.background;

    return (
        <Container maxWidth={false} disableGutters sx={{ background: `linear-gradient(${background.gradient}, ${background.default})` }}>
            <Header />
            <Container maxWidth='xl'>
                {props.children}
            </Container>
        </Container>
    );
}