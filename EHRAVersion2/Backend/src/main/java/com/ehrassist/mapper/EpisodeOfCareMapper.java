package com.ehrassist.mapper;

import com.ehrassist.entity.ConditionEntity;
import com.ehrassist.entity.EpisodeOfCareDiagnosisEntity;
import com.ehrassist.entity.EpisodeOfCareEntity;
import com.ehrassist.entity.OrganizationEntity;
import com.ehrassist.entity.PractitionerEntity;
import com.ehrassist.entity.master.ConditionCodeMasterEntity;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Component
public class EpisodeOfCareMapper {

    public EpisodeOfCare toFhirResource(EpisodeOfCareEntity entity, List<EpisodeOfCareDiagnosisEntity> diagnoses) {
        EpisodeOfCare eoc = new EpisodeOfCare();
        eoc.setId(entity.getId().toString());

        Meta meta = new Meta();
        if (entity.getVersion() != null) {
            meta.setVersionId(entity.getVersion().toString());
        }
        if (entity.getUpdatedAt() != null) {
            meta.setLastUpdated(toDate(entity.getUpdatedAt()));
        }
        eoc.setMeta(meta);

        if (entity.getStatus() != null) {
            EpisodeOfCare.EpisodeOfCareStatus status = EpisodeOfCare.EpisodeOfCareStatus.fromCode(entity.getStatus());
            if (status != null) {
                eoc.setStatus(status);
            }
        }

        if (entity.getPatient() != null) {
            eoc.setPatient(new Reference("Patient/" + entity.getPatient().getId()));
        }

        if (entity.getManagingOrganization() != null) {
            OrganizationEntity org = entity.getManagingOrganization();
            Reference orgRef = new Reference("Organization/" + org.getId());
            if (org.getName() != null) {
                orgRef.setDisplay(org.getName());
            }
            eoc.setManagingOrganization(orgRef);
        }

        if (entity.getCareManager() != null) {
            PractitionerEntity p = entity.getCareManager();
            Reference ref = new Reference("Practitioner/" + p.getId());
            String display = formatPractitionerDisplay(p);
            if (display != null) {
                ref.setDisplay(display);
            }
            eoc.setCareManager(ref);
        }

        if (entity.getPeriodStart() != null || entity.getPeriodEnd() != null) {
            Period period = new Period();
            if (entity.getPeriodStart() != null) {
                period.setStart(toDate(entity.getPeriodStart()));
            }
            if (entity.getPeriodEnd() != null) {
                period.setEnd(toDate(entity.getPeriodEnd()));
            }
            eoc.setPeriod(period);
        }

        if (hasType(entity)) {
            CodeableConcept type = new CodeableConcept();
            if (entity.getTypeText() != null) {
                type.setText(entity.getTypeText());
            }
            Coding coding = type.addCoding();
            if (entity.getTypeSystem() != null) {
                coding.setSystem(entity.getTypeSystem());
            }
            if (entity.getTypeCode() != null) {
                coding.setCode(entity.getTypeCode());
            }
            if (entity.getTypeDisplay() != null) {
                coding.setDisplay(entity.getTypeDisplay());
            }
            eoc.addType(type);
        }

        if (diagnoses != null) {
            for (EpisodeOfCareDiagnosisEntity diag : diagnoses) {
                eoc.addDiagnosis(toDiagnosisComponent(diag));
            }
        }

        return eoc;
    }

    private EpisodeOfCare.DiagnosisComponent toDiagnosisComponent(EpisodeOfCareDiagnosisEntity diag) {
        EpisodeOfCare.DiagnosisComponent comp = new EpisodeOfCare.DiagnosisComponent();
        ConditionEntity condition = diag.getCondition();
        if (condition != null) {
            Reference condRef = new Reference("Condition/" + condition.getId());
            ConditionCodeMasterEntity cm = condition.getCodeMaster();
            if (cm != null && cm.getLongTitle() != null) {
                condRef.setDisplay(cm.getLongTitle());
            }
            comp.setCondition(condRef);
        }
        if (diag.getRank() != null) {
            comp.setRank(diag.getRank());
        }
        if (diag.getRoleCode() != null || diag.getRoleDisplay() != null || diag.getRoleSystem() != null) {
            CodeableConcept role = new CodeableConcept();
            Coding c = role.addCoding();
            if (diag.getRoleSystem() != null) {
                c.setSystem(diag.getRoleSystem());
            } else {
                c.setSystem("http://terminology.hl7.org/CodeSystem/diagnosis-role");
            }
            if (diag.getRoleCode() != null) {
                c.setCode(diag.getRoleCode());
            }
            if (diag.getRoleDisplay() != null) {
                c.setDisplay(diag.getRoleDisplay());
            }
            comp.setRole(role);
        }
        return comp;
    }

    private boolean hasType(EpisodeOfCareEntity entity) {
        return entity.getTypeCode() != null
                || entity.getTypeDisplay() != null
                || entity.getTypeSystem() != null
                || entity.getTypeText() != null;
    }

    private String formatPractitionerDisplay(PractitionerEntity p) {
        if (p.getGivenName() == null && p.getFamilyName() == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (p.getGivenName() != null) {
            sb.append(p.getGivenName());
        }
        if (p.getFamilyName() != null) {
            if (sb.length() > 0) {
                sb.append(' ');
            }
            sb.append(p.getFamilyName());
        }
        return sb.toString();
    }

    private Date toDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
}
