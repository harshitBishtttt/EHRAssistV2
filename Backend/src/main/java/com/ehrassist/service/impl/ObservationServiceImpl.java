package com.ehrassist.service.impl;

import com.ehrassist.entity.ObservationEntity;
import com.ehrassist.exception.ResourceNotFoundException;
import com.ehrassist.mapper.ObservationMapper;
import com.ehrassist.repository.EncounterRepository;
import com.ehrassist.repository.ObservationRepository;
import com.ehrassist.repository.PatientRepository;
import com.ehrassist.repository.PractitionerRepository;
import com.ehrassist.repository.master.ObservationCodeMasterRepository;
import com.ehrassist.service.ObservationService;
import com.ehrassist.util.BundleBuilder;
import lombok.RequiredArgsConstructor;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Resource;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ObservationServiceImpl implements ObservationService {

    private final ObservationRepository observationRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final PractitionerRepository practitionerRepository;
    private final ObservationCodeMasterRepository observationCodeMasterRepository;
    private final ObservationMapper observationMapper;
    private final BundleBuilder bundleBuilder;

    @Override
    @Transactional(readOnly = true)
    public Observation getById(UUID id) {
        ObservationEntity entity = observationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Observation not found: " + id));
        return observationMapper.toFhirResource(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Bundle search(UUID id, UUID patientId, String code, String category, org.springframework.data.domain.Pageable pageable) {
        if (id == null && patientId == null && code == null && category == null) {
            return bundleBuilder.searchSetWithPagination("Observation", List.of(), 0L, 0, pageable.getPageSize(), "");
        }

        Specification<ObservationEntity> spec = Specification.where(null);

        if (id != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("id"), id));
        }
        if (patientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("patient").get("id"), patientId));
        }
        if (code != null) {
            spec = spec.and((root, query, cb) -> {
                var codeJoin = root.join("codeMaster");
                return cb.equal(codeJoin.get("codeValue"), code);
            });
        }
        if (category != null) {
            spec = spec.and((root, query, cb) -> {
                var codeJoin = root.join("codeMaster");
                return cb.equal(codeJoin.get("fhirCategoryCode"), category);
            });
        }

        org.springframework.data.domain.Page<ObservationEntity> pageResult = observationRepository.findAll(spec, pageable);
        
        List<Resource> fhirResources = pageResult.getContent().stream()
                .map(observationMapper::toFhirResource)
                .map(Resource.class::cast)
                .toList();

        StringBuilder queryParams = new StringBuilder();
        if (id != null) queryParams.append("_id=").append(id).append("&");
        if (patientId != null) queryParams.append("patient=").append(patientId).append("&");
        if (code != null) queryParams.append("code=").append(code).append("&");
        if (category != null) queryParams.append("category=").append(category).append("&");
        String query = queryParams.length() > 0 ? queryParams.substring(0, queryParams.length() - 1) : "";

        return bundleBuilder.searchSetWithPagination("Observation", fhirResources, pageResult.getTotalElements(), 
                pageable.getPageNumber(), pageable.getPageSize(), query);
    }

    @Override
    public Observation create(Observation resource) {
        ObservationEntity entity = observationMapper.toEntity(resource);

        if (resource.hasSubject()) {
            String ref = resource.getSubject().getReference();
            if (ref != null && ref.contains("/")) {
                UUID patientId = UUID.fromString(ref.split("/")[1]);
                entity.setPatient(patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId)));
            }
        }

        if (resource.hasEncounter()) {
            String ref = resource.getEncounter().getReference();
            if (ref != null && ref.contains("/")) {
                UUID encId = UUID.fromString(ref.split("/")[1]);
                entity.setEncounter(encounterRepository.findById(encId)
                        .orElseThrow(() -> new ResourceNotFoundException("Encounter not found: " + encId)));
            }
        }

        if (resource.hasPerformer()) {
            String ref = resource.getPerformerFirstRep().getReference();
            if (ref != null && ref.contains("/")) {
                UUID practId = UUID.fromString(ref.split("/")[1]);
                entity.setPerformer(practitionerRepository.findById(practId)
                        .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found: " + practId)));
            }
        }

        if (resource.hasCode() && resource.getCode().hasCoding()) {
            Coding coding = resource.getCode().getCodingFirstRep();
            observationCodeMasterRepository.findByCodeSystemAndCodeValue(coding.getSystem(), coding.getCode())
                    .ifPresent(entity::setCodeMaster);
        }

        ObservationEntity saved = observationRepository.save(entity);
        return observationMapper.toFhirResource(saved);
    }

    @Override
    public Observation update(UUID id, Observation resource) {
        ObservationEntity existing = observationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Observation not found: " + id));

        ObservationEntity updated = observationMapper.toEntity(resource);

        existing.setStatus(updated.getStatus());
        existing.setValueQuantity(updated.getValueQuantity());
        existing.setValueUnit(updated.getValueUnit());
        existing.setValueString(updated.getValueString());
        existing.setInterpretationCode(updated.getInterpretationCode());
        existing.setEffectiveDate(updated.getEffectiveDate());
        existing.setIssued(updated.getIssued());

        if (resource.hasSubject()) {
            String ref = resource.getSubject().getReference();
            if (ref != null && ref.contains("/")) {
                UUID patientId = UUID.fromString(ref.split("/")[1]);
                existing.setPatient(patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId)));
            }
        }

        if (resource.hasEncounter()) {
            String ref = resource.getEncounter().getReference();
            if (ref != null && ref.contains("/")) {
                UUID encId = UUID.fromString(ref.split("/")[1]);
                existing.setEncounter(encounterRepository.findById(encId)
                        .orElseThrow(() -> new ResourceNotFoundException("Encounter not found: " + encId)));
            }
        }

        if (resource.hasPerformer()) {
            String ref = resource.getPerformerFirstRep().getReference();
            if (ref != null && ref.contains("/")) {
                UUID practId = UUID.fromString(ref.split("/")[1]);
                existing.setPerformer(practitionerRepository.findById(practId)
                        .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found: " + practId)));
            }
        }

        if (resource.hasCode() && resource.getCode().hasCoding()) {
            Coding coding = resource.getCode().getCodingFirstRep();
            observationCodeMasterRepository.findByCodeSystemAndCodeValue(coding.getSystem(), coding.getCode())
                    .ifPresent(existing::setCodeMaster);
        }

        ObservationEntity saved = observationRepository.save(existing);
        return observationMapper.toFhirResource(saved);
    }

    @Override
    public void delete(UUID id) {
        ObservationEntity entity = observationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Observation not found: " + id));
        observationRepository.delete(entity);
    }
}
