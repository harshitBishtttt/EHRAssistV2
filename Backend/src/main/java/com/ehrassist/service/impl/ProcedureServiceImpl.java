package com.ehrassist.service.impl;

import com.ehrassist.entity.ProcedureEntity;
import com.ehrassist.exception.ResourceNotFoundException;
import com.ehrassist.mapper.ProcedureMapper;
import com.ehrassist.repository.EncounterRepository;
import com.ehrassist.repository.PatientRepository;
import com.ehrassist.repository.PractitionerRepository;
import com.ehrassist.repository.ProcedureRepository;
import com.ehrassist.repository.master.ProcedureCodeMasterRepository;
import com.ehrassist.service.ProcedureService;
import com.ehrassist.util.BundleBuilder;
import lombok.RequiredArgsConstructor;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Procedure;
import org.hl7.fhir.r4.model.Resource;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProcedureServiceImpl implements ProcedureService {

    private final ProcedureRepository procedureRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final PractitionerRepository practitionerRepository;
    private final ProcedureCodeMasterRepository procedureCodeMasterRepository;
    private final ProcedureMapper procedureMapper;
    private final BundleBuilder bundleBuilder;

    @Override
    @Transactional(readOnly = true)
    public Procedure getById(UUID id) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure not found: " + id));
        return procedureMapper.toFhirResource(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Bundle search(UUID id, UUID patientId, org.springframework.data.domain.Pageable pageable) {
        // If no parameters provided, return empty bundle
        if (id == null && patientId == null) {
            return bundleBuilder.searchSetWithPagination("Procedure", List.of(), 0L, 0, pageable.getPageSize(), "");
        }

        // Build specification with all provided parameters (AND logic)
        Specification<ProcedureEntity> spec = Specification.where(null);
        
        if (id != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("id"), id));
        }
        if (patientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("patient").get("id"), patientId));
        }

        org.springframework.data.domain.Page<ProcedureEntity> pageResult = procedureRepository.findAll(spec, pageable);

        List<Resource> fhirResources = pageResult.getContent().stream()
                .map(procedureMapper::toFhirResource)
                .map(Resource.class::cast)
                .toList();

        StringBuilder queryParams = new StringBuilder();
        if (id != null) queryParams.append("_id=").append(id).append("&");
        if (patientId != null) queryParams.append("patient=").append(patientId).append("&");
        String query = queryParams.length() > 0 ? queryParams.substring(0, queryParams.length() - 1) : "";

        return bundleBuilder.searchSetWithPagination("Procedure", fhirResources, pageResult.getTotalElements(), 
                pageable.getPageNumber(), pageable.getPageSize(), query);
    }

    @Override
    public Procedure create(Procedure resource) {
        ProcedureEntity entity = procedureMapper.toEntity(resource);

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
            String ref = resource.getPerformerFirstRep().getActor().getReference();
            if (ref != null && ref.contains("/")) {
                UUID practId = UUID.fromString(ref.split("/")[1]);
                entity.setPerformer(practitionerRepository.findById(practId)
                        .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found: " + practId)));
            }
        }

        if (entity.getCptCode() != null) {
            procedureCodeMasterRepository
                    .findFirstByMinCodeLessThanEqualAndMaxCodeGreaterThanEqual(entity.getCptCode(), entity.getCptCode())
                    .ifPresent(entity::setCodeMaster);
        }

        ProcedureEntity saved = procedureRepository.save(entity);
        return procedureMapper.toFhirResource(saved);
    }

    @Override
    public Procedure update(UUID id, Procedure resource) {
        ProcedureEntity existing = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure not found: " + id));

        ProcedureEntity updated = procedureMapper.toEntity(resource);

        existing.setCptCode(updated.getCptCode());
        existing.setStatus(updated.getStatus());
        existing.setDescription(updated.getDescription());
        existing.setBodySiteCode(updated.getBodySiteCode());
        existing.setBodySiteDisplay(updated.getBodySiteDisplay());
        existing.setOutcomeCode(updated.getOutcomeCode());
        existing.setPerformedStart(updated.getPerformedStart());
        existing.setPerformedEnd(updated.getPerformedEnd());

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
            String ref = resource.getPerformerFirstRep().getActor().getReference();
            if (ref != null && ref.contains("/")) {
                UUID practId = UUID.fromString(ref.split("/")[1]);
                existing.setPerformer(practitionerRepository.findById(practId)
                        .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found: " + practId)));
            }
        }

        if (existing.getCptCode() != null) {
            procedureCodeMasterRepository
                    .findFirstByMinCodeLessThanEqualAndMaxCodeGreaterThanEqual(existing.getCptCode(), existing.getCptCode())
                    .ifPresent(existing::setCodeMaster);
        }

        ProcedureEntity saved = procedureRepository.save(existing);
        return procedureMapper.toFhirResource(saved);
    }

    @Override
    public void delete(UUID id) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure not found: " + id));
        procedureRepository.delete(entity);
    }
}
