import { GroupBase, StylesConfig } from 'react-select';

export const selectTagStyle: StylesConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> = {
  container: (provided) => ({
    ...provided,
    width: '10rem',
    padding: '0.37rem 0.1rem',
    margin: '0',
    background: '#272727',
  }),
  control: (provided) => ({
    ...provided,
    color: '#2F855A',
    background: '#272727',
    boxShadow: 'none',
    border: '2px solid #2F855A',
    ':hover': {
      border: '2px solid #2F855A',
    },
    ':focus-within': {
      border: '2px solid #2F855A',
    },
    ':focus': {
      border: '2px solid #2F855A',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: '#2F855A',
  }),
  menu: (provided) => ({
    ...provided,
    background: '#272727',
    color: '#2F855A',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? '#2F855A' : '#272727',
    color: state.isSelected ? '#272727' : '#2F855A',
    transition: 'background 350ms ease-in-out',
    ':hover': {
      background: '#F0FFF4',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#2F855A',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: '#2F855A',
    transition: 'color 250ms ease-in-out',
    ':hover': {
      color: '#F0FFF4',
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#2F855A',
    transition: 'color 250ms ease-in-out',
    ':hover': {
      color: '#F0FFF4',
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    background: '#2F855A',
    transition: 'color 250ms ease-in-out',
    ':hover': {
      color: '#F0FFF4',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#2F855A',
  }),
};

export const uploadTagStyle: StylesConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> = {
  container: (provided) => ({
    ...provided,
    width: '100%',
    padding: '0.37rem 0.1rem',
    margin: '0',
    background: '#272727',
  }),
  control: (provided) => ({
    ...provided,
    color: '#121214',
    background: '#272727',
    boxShadow: 'none',
    border: '2px solid #e1e1e6',
    ':hover': {
      border: '2px solid  #e1e1e6',
    },
    ':focus-within': {
      border: '2px solid  #e1e1e6',
    },
    ':focus': {
      border: '2px solid  #e1e1e6',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: '#e1e1e6',
  }),
  menu: (provided) => ({
    ...provided,
    background: '#272727',
    color: ' #e1e1e6',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? ' #e1e1e6' : '#272727',
    color: state.isSelected ? '#272727' : ' #e1e1e6',
    transition: 'all 250ms ease-in-out',
    ':hover': {
      background: '#e1e1e6',
      color: '#272727',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#e1e1e6',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: '#e1e1e6',
    transition: 'color 250ms ease-in-out',
    ':hover': {
      color: '#121214',
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#e1e1e6',
    transition: 'color 250ms ease-in-out',
    ':hover': {
      color: '#121214',
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    background: '#e1e1e6',
    transition: 'background 250ms ease-in-out',
    ':hover': {
      background: '#121214',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#e1e1e6',
  }),
};
