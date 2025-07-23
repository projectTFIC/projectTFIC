package kr.cloud.web.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.cloud.web.entity.Devices;


@Mapper
public interface BoardMapper {

	List<Devices> selectDevicesAll();

}
