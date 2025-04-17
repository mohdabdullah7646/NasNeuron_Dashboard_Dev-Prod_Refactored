import { UIText } from "../constants/ui-text.constants";

// NON-PBM Providers
export enum NonPBMProviderEnum {
    NAS = 1,
    NEURON = 6
}

export const ProviderNames: Record<NonPBMProviderEnum, string> = {
    [NonPBMProviderEnum.NAS]: 'NAS UAE',
    [NonPBMProviderEnum.NEURON]: 'Neuron'
};


// PBM Providers
export enum PBMProviderEnum {
    NAS = 1,
    NEURON = 8
}

export const PBMProviderNames: Record<PBMProviderEnum, string> = {
    [PBMProviderEnum.NAS]: 'NAS UAE',
    [PBMProviderEnum.NEURON]: 'Neuron'
};

export enum PBMStatusEnum {
    InitialStatus = 1,
    OtherStatus = 2,
    ErrorStatus = 3,
  }

  export const PBMStatusLabels: Record<PBMStatusEnum, string> = {
    [PBMStatusEnum.InitialStatus]: UIText.LABELS.PBM_INITIAL,
    [PBMStatusEnum.OtherStatus]: UIText.LABELS.PBM_OTHER,
    [PBMStatusEnum.ErrorStatus]: UIText.LABELS.PBM_ERROR
  };

  export enum FeatureEnum {
    PBM = 'PBM',
    NON_PBM = 'NON-PBM',
    REASS = 'REAAS',
    PERSON_REGISTER = 'PERSON REGISTER',
    CLAIMS = 'CLAIMS',
    RE = 'RE'
  }