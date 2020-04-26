use std::fmt::{Debug, Display, Formatter, Result};

pub trait Context: Display + Debug {}

#[derive(Debug)]
pub struct FetchValueContext {
    pub id: String,
    pub page: usize,
}
impl Display for FetchValueContext {
    fn fmt(&self, f: &mut Formatter) -> Result {
        write!(
            f,
            "command: fetch fund value. fund-id: {}, page-number: {}",
            self.id, self.page
        )
    }
}

#[derive(Debug)]
pub struct FetchListContext {}
impl Display for FetchListContext {
    fn fmt(&self, f: &mut Formatter) -> Result {
        write!(f, "command: fetch fund list.")
    }
}

macro_rules! impl_T {
    (for $($t:ty),+) => {
        $(impl Context for $t {})*
    }
}

impl_T!(for FetchValueContext, FetchListContext, DummyContext);

#[derive(Debug)]
pub struct DummyContext;
impl Display for DummyContext {
    fn fmt(&self, f: &mut Formatter) -> Result {
        write!(f, "dummy context")
    }
}
