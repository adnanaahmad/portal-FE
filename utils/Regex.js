export const cityRegex = /^[a-zA-Z]+[\s a-zA-Z]*$/;
export const stateRegex = /^[a-zA-Z\s]+$/;
export const streetAddressRegex = /^[A-Za-z0-9-][A-Za-z0-9 -.]*$/;
export const aptSuiteNumberRegex = /^[A-Za-z0-9-][A-Za-z0-9 -.]*$/;
export const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\/([0-9]{4})$/;
export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const nameRegex = /^([a-zA-Z\-']+\s)*[a-zA-Z\-']+?$/;
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const ssnRegex = /^(?!666|000|9\d{2})(\d{3}|\*{3})(-*)(?!00)(\d{2}|\*{2})(-*)(?!0{4})\d{4}$/;
export const zipRegex = /^\d{5}(-\d{4})?$/;
export const employerNameRegex = /^[A-Za-z0-9 -.]+$/;
export const jobTitleRegex = /^[A-Za-z0-9 -.]+$/;
export const bankNameRegex = /^[A-Za-z0-9-][A-Za-z0-9 -.]*$/;