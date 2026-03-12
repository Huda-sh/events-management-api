export const messages = {
  en: {
    registration: {
      submitted: 'Registration submitted successfully',
      alreadyRegistered: 'User already registered for this event',
      eventPassed: 'Event has already passed',
      eventNotFound: 'Event not found',
      userNotFound: 'User not found',
      capacityReached: 'Event capacity reached',
      approved: 'Registration approved successfully',
      attendeesRetrieved: 'Event attendees retrieved successfully',
      userRegistrationsRetrieved: 'User registrations retrieved successfully',
    },
    validation: {
      required: '{{property}} is required',
      invalidUrl: '{{property}} must be a valid URL',
      invalidEmail: '{{property}} must be a valid email',
      invalidDate: '{{property}} must be a valid ISO 8601 date string',
      invalidEnum: '{{property}} must be one of {{values}}',
      invalidType: '{{property}} must be a {{type}}',
      minLength: '{{property}} must be at least {{min}} characters',
      passwordStrength:
        '{{property}} must contain upper case, lower case, number and special character',
    },
    error: {
      internal: 'Internal server error',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
    },
  },
  ar: {
    registration: {
      submitted: 'تم تقديم التسجيل بنجاح',
      alreadyRegistered: 'المستخدم مسجل بالفعل في هذا الحدث',
      eventPassed: 'انتهى الحدث بالفعل',
      eventNotFound: 'لم يتم العثور على الحدث',
      userNotFound: 'لم يتم العثور على المستخدم',
      capacityReached: 'تم الوصول إلى الحد الأقصى لعدد الحضور',
      approved: 'تمت الموافقة على التسجيل بنجاح',
      attendeesRetrieved: 'تم استرجاع الحضور بنجاح',
      userRegistrationsRetrieved: 'تم استرجاع تسجيلات المستخدم بنجاح',
    },
    validation: {
      required: 'حقل {{property}} مطلوب',
      invalidUrl: 'يجب أن يكون {{property}} رابطًا صالحًا',
      invalidEmail: 'يجب أن يكون {{property}} بريدًا إلكترونيًا صالحًا',
      invalidDate: 'يجب أن يكون {{property}} تاريخًا صالحًا بصيغة ISO 8601',
      invalidEnum: 'يجب أن تكون قيمة {{property}} واحدة من {{values}}',
      invalidType: 'يجب أن يكون {{property}} من النوع {{type}}',
      minLength: 'يجب أن تكون قيمة {{property}} على الأقل {{min}} أحرف',
      passwordStrength:
        'يجب أن تحتوي {{property}} على حرف كبير، وحرف صغير، ورقم، ورمز خاص',
    },
    error: {
      internal: 'خطأ داخلي في الخادم',
      unauthorized: 'غير مصرح',
      forbidden: 'ممنوع',
    },
  },
};
