import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { auditSchema, normalizePhoneNumber } from '../../../validation/auditForm';
import { COUNTRIES } from '../../ui/PhoneInput';

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  goals: [],
  tos: false,
};

const useAuditApplicationForm = () => {
  const [phoneCountry, setPhoneCountry] = useState('+49');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [clearedErrorStyles, setClearedErrorStyles] = useState({});
  const {
    register,
    handleSubmit,
    control,
    reset,
    resetField,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(auditSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
  });

  const clearErrorStyle = (fieldName) => {
    setClearedErrorStyles((currentStyles) => ({
      ...currentStyles,
      [fieldName]: true,
    }));
  };

  const onSubmit = (data) => {
    setIsSuccess(true);

    const currentCountry = COUNTRIES.find(
      (country) => country.code === phoneCountry
    );

    const fullPhoneNumber = normalizePhoneNumber({
      countryCode: phoneCountry,
      phoneNumber: data.phone,
      trunkPrefix: currentCountry?.trunkPrefix ?? '',
    });

    console.log('Form submitted perfectly:', {
      ...data,
      phone: fullPhoneNumber,
    });

    reset();
    setClearedErrorStyles({});
    setPhoneCountry('+49');
    setFormResetKey((previousKey) => previousKey + 1);
  };

  const onInvalid = (validationErrors) => {
    setClearedErrorStyles({});

    Object.keys(validationErrors).forEach((fieldName) => {
      resetField(fieldName, { keepError: true });
    });
  };

  return {
    clearErrorStyle,
    clearedErrorStyles,
    control,
    errors,
    formResetKey,
    handleSubmit,
    hasErrors: Object.keys(errors).length > 0,
    isSuccess,
    onInvalid,
    onSubmit,
    phoneCountry,
    register,
    setIsSuccess,
    setPhoneCountry,
    submitCount,
  };
};

export default useAuditApplicationForm;
